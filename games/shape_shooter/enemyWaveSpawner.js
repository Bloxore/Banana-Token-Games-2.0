import { Enemy } from './enemy.js';

class EnemyWaveSpawner {
  constructor(scene, enemyGroup) {
    this.waves = [];
    this.scene = scene;
    this._queues = 0;
    this._loadcallbacks = [];
    this._enemyGroup = enemyGroup;
  }

  /*
    Wave data is organized as follows below (spaces are irrelevent):

    Time to spawn wave (in ms): EnemyType(posX, posY), EnemyType(posX,posY) ...

    Returns an object with enemy data as a list and time as the key.
  */
  loadWaveData(url) {
    let enemyData = {};
    this._queues++;
    $.ajax(url, {
      complete: (data) => {
        if (data.statusText != "OK") {
          throw "Failed to load requested enemy data.";
        }
        let lines = data.responseText.split("\n");
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].replace(" ", "");

          //Ignore lines that do not conform to the format
          if (line.search(":") == -1 || line.search("Enemy") == -1) {
            continue;
          }

          let time = line.split(":")[0];
          let enemies = line.split(":")[1];
          enemyData[time] = enemies.split(";");
        }
        //All done loading stow result
        this.waves.push(enemyData);
        this._queues--;
        if (this._queues == 0) {
          for (let i = 0; i < this._loadcallbacks.length; i++) {
            this._loadcallbacks[i][0]();
            if (this._loadcallbacks[i][1] == true) { // if the destroy flag was set to true, remove the callback
              this._loadcallbacks.splice(i, 1);
              i--;
            }
          }
        }
      }
    });
  }

  onDoneLoading(callback, destroy = true) {
    this._loadcallbacks.push([callback, destroy]);
  }

  isLoading() {
    return this._queues != 0;
  }

  startWave(id /* Array index integer */) {
    let times = Object.keys(this.waves[id]);
    for (let i = 0; i < times.length; i++) {
      this.scene.time.delayedCall(times[i], this._spawn_enemies, [this.waves[id][times[i]]], this);
    }
  }

  _spawn_enemies(enemyList) {
    let wave_regex = /^([A-z]*)\(([0-9, ]*)\)?/
    for  (let i = 0; i < enemyList.length; i++) {
      let result = wave_regex.exec(enemyList[i].replace(" ", ""));
      let name = result[1];
      let pos = result[2].split(",");
      this._enemyGroup.add(new Enemy(this.scene, parseInt(pos[0]), parseInt(pos[1])));
    }
  }
}

export { EnemyWaveSpawner };
