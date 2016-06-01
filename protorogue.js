function say(thing) {
  speak(thing);
  console.log(thing);
}

var Game = {
    display: null,
    map: {},
    item_map: {},
    inventory_food: [],
    inventory_artifacts: [],
    inventory_steroids: [],
    engine: null,
    player: null,
    enemy: null,

    init: function() {
        this.player_info = []
        this.hp_info = []
        this.hp_curr = []
        this.hitdie = []
        this.e_hp_curr = 50
        this.monster_fight = 1;
        this.final_boss = 1;
        for (var x = 0; x < 6; x++){
          var temp_data = document.getElementById("name"+(x+1)).value
          if (temp_data == null || temp_data == "");
          else {
            var temp_option = document.getElementById("option"+(x+1)).value
            if (temp_option == null || temp_option == "") temp_option = "hum";
            this.player_info.push([temp_data, temp_option]);
            this.hp_info.push([temp_data, hitpoints[temp_option]]);
            this.hp_curr.push([temp_data, hitpoints[temp_option]]);
            this.hitdie.push([temp_data, hitdie[temp_option]]);
          }
        }
        var dataform = document.getElementById('dataform');
        document.body.removeChild(dataform);
        var button = document.getElementById('submit');
        document.body.removeChild(button);
        this.display = new ROT.Display({spacing:1.1});
        this.display.getContainer().id = "escape";
        document.body.appendChild(this.display.getContainer());
        this.status = document.createElement("div");
        this.status.id = "status";
        document.body.appendChild(this.status);
        this.players = document.createElement("ul");
        this.players.id = "players";
        this.status.appendChild(this.players);
        this.player_list = [];
        this.dead = []
        for (var x = 0; x < this.player_info.length; x++){
          this.player_list.push([this.player_info[x][0], document.createElement("li")]);
          this.player_list[this.player_list.length - 1][1].textContent = this.player_info[x][0] + " the " + option_titles[this.player_info[x][1]] + ". ";
          this.player_list[this.player_list.length - 1][1].textContent += "HP: " + this.hp_curr[x][1] + "/" + this.hp_info[x][1] + ". ";
          this.player_list[this.player_list.length - 1][1].textContent += "hitdie: " + this.hitdie[x][1][0] + "d" + this.hitdie[x][1][1] + ".";
          this.players.appendChild(this.player_list[this.player_list.length - 1][1]);
          this.dead.push(0);
        }
        this.villains = document.createElement("ul");
        this.status.appendChild(this.villains);
        this.villains.id = "villains"
        this.villain = document.createElement("li");
        this.villains.appendChild(this.villain);
        this.level = 1;
        this.villain.textContent = enemies[this.level - 1][0] + " HP: "+ this.e_hp_curr + "/" + enemies[this.level - 1][1] + " hitdie: " + enemies[this.level - 1][2][0] + "d" + enemies[this.level - 1][2][1]
        document.getElementById("yr").textContent = year[this.level-1]
        this.inventory_parent = document.createElement("div");
        this.inventory_parent.textContent = "Inventory ([u]se item): "
        this.status.appendChild(this.inventory_parent);
        this.inventory = document.createElement("span");
        this.inventory_parent.appendChild(this.inventory);

        this._generateMap();

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        scheduler.add(this.enemy, true);

        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    },

    _generateMap: function() {
        var digger = new ROT.Map.Digger();
        var freeCells = [];

        var digCallback = function(x, y, value) {
            if (value) { return; }

            var key = x+","+y;
            this.map[key] = ".";
            freeCells.push(key);
        }
        digger.create(digCallback.bind(this));

        freeCells = this._generateBoxes(freeCells);
        this._drawWholeMap();

        if(this.level == 1){
          this.player = this._createBeing(Player, freeCells);
          this.enemy = this._createBeing(Enemy, freeCells);
        }
        else {
          var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
          var key = freeCells.splice(index, 1)[0];
          var parts = key.split(",");
          var x = parseInt(parts[0]);
          var y = parseInt(parts[1]);
          this.player._x = x
          this.player._y = y
          var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
          var key = freeCells.splice(index, 1)[0];
          var parts = key.split(",");
          var x = parseInt(parts[0]);
          var y = parseInt(parts[1]);
          this.enemy._x = x
          this.enemy._y = y
        }

    },

    _createBeing: function(what, freeCells) {
        var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        var key = freeCells.splice(index, 1)[0];
        var parts = key.split(",");
        var x = parseInt(parts[0]);
        var y = parseInt(parts[1]);
        return new what(x, y);
    },

    _generateBoxes: function(freeCells) { /*We put 5 items on the ground each level. When RF is spawned, you cannot exit the stairs until you have it in your inventory.*/
        for (var i=0;i<6;i++) {
            var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
            var key = freeCells.splice(index, 1)[0];
            if (i == 0 && this.level < 4){
              this.map[key] = "<"; //put down a staircase
            }
            else if (i == 1){
              this.map[key] = "!"; //drop the artifact
              this.item_map[key] = artifacts[this.level - 1]
            }
            else if (i == 2){
              this.map[key] = "+"; //drop a steroid
              this.item_map[key] = steroid[this.level - 1][0]
            }
            else {
              this.map[key] = "*";
              this.item_map[key] = foods[Math.floor(ROT.RNG.getUniform() * foods.length)][0];
            }

        }
        return freeCells;
    },

    _drawWholeMap: function() {
        for (var key in this.map) {
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            this.display.draw(x, y, this.map[key]);
        }
    },

    _clear: function() {
      var context = document.getElementById('escape').getContext("2d");
      context.clearRect(0, 0, document.getElementById('escape').width, document.getElementById('escape').height);
    }
};

var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Player.prototype.getSpeed = function() { return 100; }
Player.prototype.getX = function() { return this._x; }
Player.prototype.getY = function() { return this._y; }

Player.prototype.act = function() {
    Game.engine.lock();
    window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
    var code = e.keyCode;

    if (code == 85) { //u! Use an item!
      var item_to_be_used = prompt("Please enter the number of the item you would like to use.");
      var inventory = Game.inventory_food.concat(Game.inventory_artifacts,Game.inventory_steroids);
      var idx_food = Game.inventory_food.indexOf(inventory[item_to_be_used]);
      var idx_artifacts = Game.inventory_artifacts.indexOf(inventory[item_to_be_used]);
      var idx_steroids = Game.inventory_steroids.indexOf(inventory[item_to_be_used]);
      if (idx_food > -1){//then it's food
        say("Your party eats the "+Game.inventory_food[idx_food]+" loudly and messily.");
        var to_heal = foods_redundant[Game.inventory_food[idx_food]];
        if (to_heal < 0){
          say("Bleh! You all wheeze and cough. That was horrible. You each lose "+ (-to_heal) + " hit points.");
        }
        if (to_heal > 0){
          say("Yum. You each gain "+ (to_heal) + " hit points.");
        }
        for (var x = 0; x < Game.hp_curr.length; x++){
          Game.hp_curr[x][1] += to_heal;
        }
        check_for_death();
        Game.inventory_food.splice(idx_food,1);
      }
      if (idx_artifacts > -1){
        say("You rub the "+Game.inventory_artifacts[idx_artifacts]+" vigorously.");
        if(Game.inventory_artifacts[idx_artifacts] == "Figurine of Richard Feynman" && Game.final_boss == 0){
          say("Congratulations. You have ascended. You have truly found what it means to escape from this place. May you enlighten the hapless Darbs who would spend an eternity struggling without the knowledge you have acquired. Your next mission is to embark to Smouse.");
        }
        else say("Nothing seems to happen...");
      }
      if (idx_steroids > -1){
        say("You pump yourself up and begin reading the "+Game.inventory_steroids[idx_steroids]+" in earnest. Your party gains "+ steroid_redundant[Game.inventory_steroids[idx_steroids]]+" attack points on each hit!");
        for (var x = 0; x < Game.hitdie.length; x++){
          Game.hitdie[x][1][1] += steroid_redundant[Game.inventory_steroids[idx_steroids]];
        }
        Game.inventory_steroids.splice(idx_steroids,1);
      }
      for (var x = 0; x < Game.player_info.length; x++){
        Game.player_list[x][1].textContent = Game.player_info[x][0] + " the " + option_titles[Game.player_info[x][1]] + ". ";
        Game.player_list[x][1].textContent += "HP: " + Game.hp_curr[x][1] + "/" + Game.hp_info[x][1] + ". ";
        Game.player_list[x][1].textContent += "hitdie: " + Game.hitdie[x][1][0] + "d" + Game.hitdie[x][1][1] + ".";
      }
      var inventory = Game.inventory_food.concat(Game.inventory_artifacts,Game.inventory_steroids);
      for (var x=0; x < inventory.length; x++){
        inventory[x] = "["+x+"] "+ inventory[x]
      }
      Game.inventory.textContent = inventory.join(",")
      //
    }

    var keyMap = {};
    keyMap[38] = 0;
    keyMap[33] = 1;
    keyMap[39] = 2;
    keyMap[34] = 3;
    keyMap[40] = 4;
    keyMap[35] = 5;
    keyMap[37] = 6;
    keyMap[36] = 7;

    /* one of numpad directions? */
    if (!(code in keyMap)) { return; }

    /* is there a free space? */
    var dir = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + dir[0];
    var newY = this._y + dir[1];
    var newKey = newX + "," + newY;
    if (!(newKey in Game.map)) { return; }

    Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
    this._x = newX;
    this._y = newY;
    var key = this._x + "," + this._y;
    if (Game.map[key] == "*" || Game.map[key] == "!" || Game.map[key] == "+"){
      say("You picked up a " + Game.item_map[key]);
      if (Game.map[key] == "*") Game.inventory_food.push(Game.item_map[key]);
      else if (Game.map[key] == "!") Game.inventory_artifacts.push(Game.item_map[key]);
      else if (Game.map[key] == "+") Game.inventory_steroids.push(Game.item_map[key]);
      inventory = Game.inventory_food.concat(Game.inventory_artifacts,Game.inventory_steroids)
      for (var x=0; x < inventory.length; x++){
        inventory[x] = "["+x+"] "+ inventory[x]
      }
      Game.inventory.textContent = inventory.join(",")
      Game.map[key] = ".";
      Game.item_map[key] = "";
    }
    if (Game.map[key] == "<"){
      if (Game.level < 3){
        say("You go down the stairs.");
        Game.level += 1;
        document.getElementById("yr").textContent = year[Game.level-1]
        Game.map = {};
        Game.item_map = {};
        Game._clear();
        Game._generateMap();
        Game._drawWholeMap();
        Game.display.draw(Player._x, Player._y, Game.map[this._x+","+this._y]);
        Game.e_hp_curr = enemies[Game.level - 1][1]
        Game.villain.textContent = enemies[Game.level - 1][0] + " HP: "+ Game.e_hp_curr + "/" + enemies[Game.level - 1][1] + " hitdie: " + enemies[Game.level - 1][2][0] + "d" + enemies[Game.level - 1][2][1]
        Game.monster_fight = 1;
      }
      else if (Game.level == 3){
        if (Game.inventory_artifacts.indexOf("Figurine of Richard Feynman") > -1) {
          say("You go down the stairs.");
          Game.level += 1;
          document.getElementById("yr").textContent = year[Game.level-1]
          Game.map = {};
          Game.item_map = {};
          Game._clear();
          Game._generateMap();
          Game._drawWholeMap();
          Game.display.draw(Player._x, Player._y, Game.map[this._x+","+this._y]);
          Game.e_hp_curr = enemies[Game.level - 1][1]
          Game.villain.textContent = enemies[Game.level - 1][0] + " HP: "+ Game.e_hp_curr + "/" + enemies[Game.level - 1][1] + " hitdie: " + enemies[Game.level - 1][2][0] + "d" + enemies[Game.level - 1][2][1]
          Game.monster_fight = 1;
        }
        else say("You feel like you might have missed an important item.");
      }
    }
    this._draw();
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
}

Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "@", "#ff0");
}

function check_for_death() {
  if (Game.e_hp_curr < 0.1){
    //monster dead
    Game.monster_fight = 0; // no will to battle!
    if (Game.level == 4){
      Game.final_boss = 0;
    }
  }
  for(var x=0; x<Game.hp_curr.length; x++){
    if(Game.hp_curr[x][1] < 0.1 && Game.dead[x] == 0){
      say("Oh dear, " + Game.hp_curr[x][0] + " has been unable to complete the adventure. But fear not! They can fight again once their hit points are nonzero.");
      Game.dead[x] = 1;
    }
  }
}

var Enemy = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
}

Enemy.prototype.getSpeed = function() { return 100; }

Enemy.prototype.act = function() {
    var x = Game.player.getX();
    var y = Game.player.getY();

    if (Object.keys(Game.map).length > 0){

      var passableCallback = function(x, y) {
          return (x+","+y in Game.map);
      }
      var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});

      var path = [];
      var pathCallback = function(x, y) {
          path.push([x, y]);
      }
      astar.compute(this._x, this._y, pathCallback);

      path.shift();
      if (path.length < 2) {
        var to_say = "";
        if (Game.monster_fight > 0){
          for (var x=0; x < Game.hitdie.length; x++){
            if(Game.hp_curr[x][1] > 0.1){
              var rolls = []
              for (var y=0; y < Game.hitdie[x][1][0]; y++){
                rolls.push(Math.floor(ROT.RNG.getUniform() * Game.hitdie[x][1][1]));
                Game.e_hp_curr -= rolls[rolls.length-1]
              }
              Game.villain.textContent = enemies[Game.level - 1][0] + " HP: "+ Game.e_hp_curr + "/" + enemies[Game.level - 1][1] + " hitdie: " + enemies[Game.level - 1][2][0] + "d" + enemies[Game.level - 1][2][1]
              to_say = to_say + Game.hitdie[x][0] + " hits the monster for "+ rolls.join(",") +". ";
              check_for_death();
            }
            else to_say = to_say + Game.hp_curr[x][0] + " is incapacitated and cannot fight! "
          }
          for (var z=0; z < enemies[Game.level-1][2][0]; z++){
            var damage = Math.floor(ROT.RNG.getUniform()*enemies[Game.level-1][2][1])
            var person_hit = Math.floor(ROT.RNG.getUniform()*Game.hitdie.length)
            to_say = to_say + enemies[Game.level-1][0] + " hits " + Game.hitdie[person_hit][0] + " for " + damage + " damage. ";
            Game.hp_curr[person_hit][1] -= damage;
            for (var x = 0; x < Game.player_info.length; x++){
              Game.player_list[x][1].textContent = Game.player_info[x][0] + " the " + option_titles[Game.player_info[x][1]] + ". ";
              Game.player_list[x][1].textContent += "HP: " + Game.hp_curr[x][1] + "/" + Game.hp_info[x][1] + ". ";
              Game.player_list[x][1].textContent += "hitdie: " + Game.hitdie[x][1][0] + "d" + Game.hitdie[x][1][1] + ".";
            }
            check_for_death();
          }
          say(to_say);
        }
      } else if (path.length > 0) {
          x = path[0][0];
          y = path[0][1];
          Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
          if (Game.monster_fight > 0){
            this._x = x;
            this._y = y;
            this._draw();
          }
      }
    }
}

Enemy.prototype._draw = function() {
    Game.display.draw(this._x, this._y, enemies[Game.level - 1][0][0], "red");
}

var option_titles = {
    "math": "Mathemagus",
    "physics": "Undead",
    "chem": "Alchemist",
    "bio": "Bionic",
    "cs": "Inscriber",
    "hum": "Bard",
    "me": "Barbarian",
    "ec": "Ecomancer"}

var hitpoints = {
    "math": 10,
    "physics": 13,
    "chem": 14,
    "bio": 17,
    "cs": 15,
    "hum": 8,
    "me": 20,
    "ec": 8}

var hitdie = {
    "math": [4,3],
    "physics": [5,2],
    "chem": [1,18],
    "bio": [3,3],
    "cs": [4,2],
    "hum": [1,20],
    "me": [1,7],
    "ec": [1,13]}


//items can be used to increase each member's health or their hitdie.
//foods can be randomly generated all over the place, really.
//if a value is negative, eating it will make you blechh
var foods = [["CDS Ration", -1],
["Chouse Meal", 2],
["Mystery Meat", -2],
["Mannion Dinner", 3]]

var foods_redundant = {"CDS Ration": -1,
"Chouse Meal": 2,
"Mystery Meat": -2,
"Mannion Dinner": 3} //because I'm a bad programmer!

//one of each of the following is always spawned.
var artifacts = ["Book of Carl Sagan", "Add/Drop Card", "Figurine of Richard Feynman", "Relic of Nate Lewis"]

//one of each of the following is dropped at every level, sequentially.
var steroid = [["Physics textbook", 1],["Biology textbook", 1],["Math 2 textbook", 2],["Chemistry textbook", 2]]
var steroid_redundant = {"Physics textbook": 1,"Biology textbook": 1,"Math 2 textbook": 2,"Chemistry textbook": 2}

var enemies = [["Pass Fail Monster", 50, [1,4]], ["Core", 150, [1,8]], ["SURF Monstrosity", 200, [3,4]], ["Final Option", 300, [4,4]]]

var year = ["frosh", "smore", "junior", "senior"]
