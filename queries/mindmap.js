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
        labels: []
      };
      let columns = {};
      let cards = {};
      let items = {};

      let colRows = [];
      let cardRows = [];
      let itemRows = [];

      let updateNode = (tree, parent = null) => {
        let { id, name } = tree.data;
        switch (tree.level) {
          case 2:
            colRows.push(`('${name}', ${desk.id})`);
            desk.columns = [...desk.columns, id];
            columns[id] = { id: id, name: name, cards: [] };
            break;
          case 3:
            columns[parent.data.id].cards = [...columns[parent.data.id].cards, id];
            cards[id] = { id: id, name: name, checklists: [{ id: 0, card_id: id, items: [] }] };
            break;
          case 4:
            cards[parent.data.id].checklists[0].items = [
              ...cards[parent.data.id].checklists[0].items,
              id
            ];
            items[id] = name;
            break;
        }
        if (tree.children.length) {
          tree.children.forEach(child => updateNode(child, tree));
        }
      };

      updateNode(mindmap);

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
        let newCards = cardRes.rows.map(card => {
          // if (card.column_id === colId) {
          return card.id;
          // }
        });

        finalColumns[colId].cards = finalColumns[colId].cards.map(oldCardId => {
          let cardIndex = Object.keys(cards).indexOf(oldCardId + '');
          let oldCards = Object.values(cards);
          console.log('line 116', oldCards, oldCardId, cardIndex, newCards);
          finalCards[newCards[cardIndex]] = {
            ...oldCards[cardIndex],
            id: newCards[cardIndex],
            checklists: [{ ...oldCards[cardIndex].checklists[0], card_id: newCards[cardIndex] }],
            desc: '',
            deadline: null,
            comments: [],
            users: [],
            checked: false,
            labels: [],
            column_id: columnId
          };

          return newCards[cardIndex];
        });
      });

      let checkRes =
        Object.keys(finalCards).length &&
        (await pool.query(
          `insert into checklist (card_id, name) values (${Object.keys(finalCards).join(
            ", ''), ("
          )}, '') returning id, card_id`
        ));

      checklists = {};
      checkRes &&
        checkRes.rows.forEach(check => {
          checklists[check.card_id] = check.id;
        });

      Object.values(finalCards).forEach(card => {
        finalCards[card.id].checklists = card.checklists.map(check => {
          console.log(check.items, items);
          check.items = check.items.map(item => {
            itemRows.push(`(${checklists[card.id]}, '${items[item]}', false )`);

            return { id: item, text: items[item], checked: false };
          });

          return { ...check, id: checklists[card.id], name: '' };
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
          checkitems[item.checklist_id] = item.id;
        });

      Object.values(finalCards).forEach(card => {
        let checkId = finalCards[card.id].checklists[0].id;
        finalCards[card.id].checklists[0].items = card.checklists[0].items.map(item => {
          return { ...item, id: checkitems[checkId] };
        });
      });

      // console.log('\n(final)', desk, columns, cards, finalColumns, finalCards);
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
          data: { id: +(desk.id + '' + id), name: columns[id].name },
          level: 2,
          children: []
        });
        columns[id].cards.forEach((cardId, cardIndex) => {
          mindmap.children[colIndex].children.push({
            data: { id: +(desk.id + '' + id + cardId), name: cards[cardId].name },
            level: 3,
            children: []
          });
          cards[cardId].checklists.forEach((checkId, checkIndex) => {
            cards[cardId].checklists[checkIndex].items.forEach(item => {
              mindmap.children[colIndex].children[cardIndex].children.push({
                data: { id: +(desk.id + '' + id + cardId + item.id), name: item.text },
                level: 4,
                children: []
              });
            });
          });
        });
      });

      console.log(mindmap);
      console.log(JSON.stringify(mindmap));

      let result = await pool.query(
        `update desk set mind_map = '${JSON.stringify(mindmap)}' where id = ${desk.id} `
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
