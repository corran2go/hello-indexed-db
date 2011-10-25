var helloIndexedDB = {
  self: this,
  db: null,

  open: function() {
    var request = indexedDB.open('todos', 'todo manager');

    request.onsuccess = function(e) {
      var v = '1.0';
      var db = e.target.result;
      this.db = db;
      if (v != db.version) {
        var setVrequest = db.setVersion(v);

        setVrequest.onfailure = this.onerror;
        setVrequest.onsuccess = function(e) {
          var store = db.createObjectStore('todo', {keyPath: 'timeStamp'});
          
          this.getAllTodoItems();
        };
      }
      
      this.getAllTodoItems();
    };

    request.onfailure = this.onerror;
  },

  insertTodo: function(todoText) {
    var tx = this.db.transaction(['todo'], IDBTransaction.READ_WRITE, 0);
    var store = tx.objectStore('todo');
    var request = store.put({
      'text': todoText,
      'timeStamp': new Date().getTime()
    });

    request.onsuccess = function(e) {
      this.getAllTodoItems();
    };

    request.onerror = function(e) {
      console.log('ERROR ' + e.value);
    };
  },

// --
  onError: function(tx, err) {
    console.log('ERROR ' + err.code + ': ' + err.message);
  },

  onSuccess: function(tx, rs) {
    getAllTodoItems(loadTodoItems);
  },

  createTable: function() {
    db.transaction(function(tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS ' +
                    'todo(ID INTEGER PRIMARY KEY, todo TEXT, created DATETIME)', []);
    });
  },


  getAllTodoItems: function(renderFunc) {
    db.transaction(function(tx) {
      tx.executeSql('SELECT * FROM todo', [], renderFunc, onError);
    });
  },

  loadTodoItems: function(tx, rs) {
    var rowOutput = '';
    for (var i=0; i < rs.rows.length; i++) {
      rowOutput += renderTodo(rs.rows.item(i));
    }
    var todoItems = document.getElementById('todoItems');
    todoItems.innerHTML = rowOutput;
  },

  renderTodo: function(row) {
    return '<li>' + row.ID + ' - ' + row.todo +
           ' [ <a onclick="deleteTodo(' + row.ID + ');">X</a> ]</li>';
  },

  deleteTodo: function(id) {
    db.transaction(function(tx) {
      tx.executeSql('DELETE FROM todo WHERE ID=?', [id],
                    onSuccess, onError);
    });
  },

  addTodo: function() {
    var todo = document.getElementById('todo');
    insertTodo(todo.value);
    todo.value = '';
  },

  init: function() {
    alert('started');
    // open();
    // createTable();
    // getAllTodoItems(loadTodoItems);
  }
};
