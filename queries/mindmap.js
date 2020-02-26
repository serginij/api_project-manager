const db = require('../db');
const helpers = require('../helpers');

const pool = db.pool;

const parseMindmap = async (request, response) => {
  const { teamId, mindmap } = request.body;
  console.log('parseMindmap', request.params, request.body);

  // const { user_id, username } = helpers.checkToken(request, response);

  try {
    // let teamId = await pool.query(
    //   'select team_id where id = (select desk_id from public.column where id=(select column_id from card where id = $1))',
    //   [cardId]
    // );
    // let user = await pool.query(
    //   'select is_admin from team_user where user_id = $1 and team_id = $2',
    //   [user_id, teamId.rows[0].team_id]
    // );
    // let deskUser;

    if (mindmap) {
      // console.log(mindmap);

      let deskId = await pool.query(
        'insert into desk (team_id, name) values ($1, $2) returning id',
        [teamId, mindmap.data.name]
      );

      let desk = {
        name: mindmap.data.name,
        id: deskId.rows[0].id,
        columns: [],
        team_id: teamId,
        users: [],
        labels: {}
      };
      let columns = {};
      let cards = {};
      let items = {};
      let checks = {};
      let labels = {};

      let colRows = [];
      let cardRows = [];
      let checkRows = [];
      let itemRows = [];
      let labelRows = [];

      let updateNode = (tree, parent = null) => {
        let { id, name, color } = tree.data;
        switch (tree.level) {
          case 2:
            colRows.push(`('${name}', ${desk.id})`);
            desk.columns = [...desk.columns, id];
            columns[id] = { id: id, name: name, cards: [] };
            break;
          case 3:
            let labelId = null;
            Object.values(labels).forEach((c, index) => {
              if (c === color) {
                labelId = Object.keys(labels)[index];
              }
            });
            if (labelId == null && color !== '000000') {
              labelId = Object.keys(labels).length;
              labels[labelId] = color;
              labelRows.push(`(${desk.id}, '${color}', '')`);
            }

            cards[id] = { id: id, name: name, checklists: [], label: labelId };
            columns[parent.data.id].cards = [...columns[parent.data.id].cards, id];
            break;
          case 4:
            let check = cards[parent.data.id].checklists.filter(check => check.color === color);
            if (check.length) {
              cards[parent.data.id].checklists = cards[parent.data.id].checklists.map(el => {
                if (el.id === check[0].id) {
                  return { ...el, items: [...el.items, id] };
                }
                return el;
              });
            } else {
              cards[parent.data.id].checklists = [
                ...cards[parent.data.id].checklists,
                { id: cards[parent.data.id].checklists.length, name: '', color: color, items: [id] }
              ];
              checks[cards[parent.data.id].checklists.length] = { name: '', items: [id] };
            }

            items[id] = name;
            break;
        }
        if (tree.children.length) {
          tree.children.forEach(child => updateNode(child, tree));
        }
      };

      updateNode(mindmap);

      let labelRes =
        labelRows.length &&
        (await pool.query(
          `insert into label (desk_id, color, name) values ${labelRows.join(',')} returning id`
        ));

      let newLabels = labelRes && labelRes.rows.map(label => label.id);

      newLabels.forEach((id, index) => {
        let labelId = Object.keys(labels)[index];
        desk.labels[id] = { color: labels[labelId], id: id, desk_id: desk.id, name: '' };
      });

      let colRes =
        colRows.length &&
        (await pool.query(
          `insert into public.column (name, desk_id) values ${colRows.join(',')} returning id`
        ));

      let finalColumns = {};
      let finalCards = {};

      let newColumns =
        colRes &&
        colRes.rows.map(col => {
          return col.id;
        });

      desk.columns = desk.columns.map((colId, index) => {
        let id = colRes.rows[index].id;
        let colIndex = Object.keys(columns).indexOf(colId + '');
        let oldColumns = Object.values(columns);

        finalColumns[newColumns[colIndex]] = { ...oldColumns[colIndex], id: newColumns[colIndex] };

        finalColumns[newColumns[colIndex]].cards.forEach(cardId => {
          cardRows.push(`('${cards[cardId].name}',${newColumns[colIndex]})`);
        });

        return id;
      });

      let cardRes =
        cardRows.length &&
        (await pool.query(
          `insert into card (name, column_id) values ${cardRows.join(',')} returning id, column_id`
        ));

      desk.columns.forEach((colId, index) => {
        columnId = colRes.rows[index].id;
        let newCards = cardRes.rows.map(card => card.id);

        finalColumns[colId].cards = finalColumns[colId].cards.map(oldCardId => {
          let cardIndex = Object.keys(cards).indexOf(oldCardId + '');
          let oldCards = Object.values(cards);
          finalCards[newCards[cardIndex]] = {
            ...oldCards[cardIndex],
            id: newCards[cardIndex],
            checklists: oldCards[cardIndex].checklists.map((check, i) => {
              checkRows.push(`(${newCards[cardIndex]}, '${i}')`);
              return { ...check, card_id: newCards[cardIndex], name: i + '' };
            }),
            desc: '',
            deadline: null,
            comments: [],
            users: [],
            checked: false,
            labels: [newLabels[Object.keys(labels).indexOf(oldCards[cardIndex].label + '')]],
            column_id: columnId
          };

          return newCards[cardIndex];
        });
      });

      let cardLabels = [];

      Object.values(finalCards).forEach(card => {
        cardLabels.push(`(${card.labels[0]}, ${card.id})`);
      });

      cardLabels.length &&
        (await pool.query(
          `insert into card_label (label_id, card_id) values ${cardLabels.join(',')}`
        ));

      let checkRes =
        checkRows.length &&
        (await pool.query(
          `insert into checklist (card_id, name) values ${checkRows.join(
            ','
          )} returning id, card_id`
        ));

      checklists = {};
      checkRes &&
        checkRes.rows.forEach(check => {
          if (checklists[check.card_id]) {
            checklists[check.card_id] = [...checklists[check.card_id], check.id];
          } else {
            checklists[check.card_id] = [check.id];
          }
        });

      Object.values(finalCards).forEach(card => {
        finalCards[card.id].checklists = card.checklists.map((check, index) => {
          return {
            id: checklists[card.id][index],
            items: check.items.map(item => {
              console.log('196', check);
              itemRows.push(`(${checklists[card.id][index]}, '${items[item]}', false)`);
              return { text: items[item], id: item, checked: false };
            })
          };
        });
      });

      let itemRes =
        itemRows.length &&
        (await pool.query(
          `insert into checkitem (checklist_id, text, checked) values ${itemRows.join(
            ','
          )} returning id, checklist_id`
        ));

      checkitems = {};
      itemRes &&
        itemRes.rows.forEach(item => {
          if (checkitems[item.checklist_id]) {
            checkitems[item.checklist_id] = [...checkitems[item.checklist_id], item.id];
          } else {
            checkitems[item.checklist_id] = [item.id];
          }
        });

      Object.values(finalCards).forEach(card => {
        finalCards[card.id].checklists = finalCards[card.id].checklists.map(check => {
          return {
            ...check,
            items: check.items.map((item, index) => {
              return { ...item, id: checkitems[check.id + ''][index] };
            })
          };
        });
      });

      response.status(201).send({
        message: `Desk added successfully`,
        ok: true,
        desk: desk,
        columns: finalColumns,
        cards: finalCards
      });
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    response.status(500).send({ message: `Something went wrong`, ok: false });
    console.log('parseMindmap', err);
  }
};

const parseDesk = async (request, response) => {
  const { desk, columns, cards } = request.body;
  console.log('parseDesk', request.params, request.body);
  try {
    if (desk.id) {
      let mindmap = {
        data: { name: desk.name, id: desk.id },
        level: 1,
        children: []
      };
      desk.columns.forEach((id, colIndex) => {
        mindmap.children.push({
          data: { id: +(desk.id + '' + id), name: columns[id].name, color: '000000' },
          level: 2,
          children: []
        });
        columns[id].cards.forEach((cardId, cardIndex) => {
          let card = cards[cardId];
          // console.log(card.labels[0], desk.labels[card.labels[0]]);
          let color = card.labels[0] ? desk.labels[card.labels[0]].color : '000000';
          mindmap.children[colIndex].children.push({
            data: {
              id: +(desk.id + '' + id + cardId),
              name: card.name,
              color: color
            },
            level: 3,
            children: []
          });
          cards[cardId].checklists.forEach((checkId, checkIndex) => {
            cards[cardId].checklists[checkIndex] &&
              cards[cardId].checklists[checkIndex].items.forEach(item => {
                mindmap.children[colIndex].children[cardIndex].children.push({
                  data: {
                    id: +(desk.id + '' + id + cardId + item.id),
                    name: item.text,
                    color: color
                  },
                  level: 4,
                  children: []
                });
              });
          });
        });
      });

      console.log(JSON.stringify(mindmap));

      let result = await pool.query(
        `update desk set mind_map = '${JSON.stringify(mindmap).replace("'", "''")}' where id = ${
          desk.id
        } `
      );

      response.status(201).send({
        message: `Mindmap added successfully`,
        ok: true,
        mindmap: mindmap
      });
    } else {
      response.status(400).send({ message: 'Incorrect data', ok: false });
    }
  } catch (err) {
    helpers.handleErrors(response, err);
    console.log('parseDesk err', err);
  }
};

module.exports = { parseMindmap, parseDesk };
