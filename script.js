//Variablendeklaration
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var startGame = false;

//Score Variablen
var score = 0;
var scoreForBoss = 50;

//Intervalle
var intervalGameLoop;
var intervalCreateEnemies;
var intervalShootBossBullets;

//Canvas Variablen
var canvas_width = canvas.width,
    canvas_height = canvas.height;

//Key Variablen
var downKey = false,
    upKey = false,
    rightKey = false,
    leftKey = false;

//Player Variablen
var imgPlayer = new Image(),
    player_x = 0,
    player_y = 0,
    player_width = 50,
    player_height = 50,
    player_vel = 1;

//Bullet Variablen
var imgBullet = new Image(),
    bullet_changeImage = true,
    bullets = [],
    bullet_index = 0,
    bullet_x,
    bullet_y,
    bullet_width = 50,
    bullet_height = 10,
    bullet_vel = 3;

//Gegner Variablen
var imgEnemy = new Image(),
    imgEnemyIce = new Image(),
    imgEnemyBullets = new Image(),
    enemies = [],
    enemies_bullets = [],
    enemy_x = canvas_width,
    enemy_y = ((Math.random() * canvas_height) - 200) + 100,
    enemy_width = 50,
    enemy_height = 50,
    enemy_vel = 0.5;

//Boss Variablen
var imgBoss = new Image(),
    imgBossBullets = new Image(),
    isBossPhase = false,
    bossHealth = 50,
    bossLocation,
    boss_bullets = [],
    boss_x = canvas_width,
    boss_y = (canvas_height / 2),
    boss_width = 100,
    boss_height = 100,
    boss_vel = 0.1;

//background Variablen
var imgBackground = new Image(),
    background_x = 0,
    background_y = 0,
    background_height = canvas_height,
    background_width = 5120,
    background_vel = 0.03;

//Titelbildschirm
function titleScreen() {
    ctx.font = "100px Arial";
    ctx.fillText("Safroni", 240, 300);
    ctx.fillText("Spaceshooter", 100, 400);

    ctx.font = "20px Arial";
    ctx.fillText("Press Enter to Start!", 0, 20);
}

function initGame() {
    //Titlescreen clearen
    ctx.clearRect(0, 0, canvas_width, canvas_height);

    //Initialisieren von Bildern
    imgPlayer.src = 'src/img/safronicat.png';
    imgBullet.src = 'src/img/fireball.png';
    imgEnemy.src = 'src/img/spaceship.png';
    imgEnemyIce.src = 'src/img/iceship.png';
    imgEnemyBullets.src = 'src/img/spaceship.png';
    imgBoss.src = 'src/img/safronicat.png';
    imgBossBullets.src = 'src/img/safronicat.png';
    imgBackground.src = 'src/img/background.png';

    //Falls Game gestartet ist:
    if (startGame) {
        intervalCreateEnemies = setInterval(createEnemy, 1000);
        intervalGameLoop = setInterval(gameLoop, 1);
        intervalShootBossBullets = setInterval(createBossBullet, 1000);
    }
}

function gameLoop() {
    //Den ganzen Canvas clearen
    ctx.clearRect(0, 0, canvas_width, canvas_height);
    ctx.clearRect(player_x, player_y, player_width, player_height);
    ctx.clearRect(boss_x, boss_y, boss_width, boss_height);
    for (let i = 0; i < bullets.length; i++) {
        ctx.clearRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
    }
    for (let i = 0; i < enemies.length; i++) {
        ctx.clearRect(enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
    }

    //Checken ob Bossphase kommt
    if (score == scoreForBoss) {
        scoreForBoss += 50;
        isBossPhase = true;
    }

    if (isBossPhase) {
        if (boss_x >= canvas_width - 150) {
            drawBackground();
            drawBossHealthbar(canvas_width - 400, 10, bossHealth, 500, 25);
            moveBoss();
            drawBoss();
            movePlayer();
            drawPlayer();
            boss_x -= boss_vel;
        } else {
            bossPhase();
        }
    } else {
        //Loop:
        drawBackground();
        shootEnemyBullet();
        moveEnemy();
        drawEnemy();
        moveBullet();
        drawBullet();
        movePlayer();
        drawPlayer();
        checkCollision();
    }
}

//Was in der Bossphase passiert:
function bossPhase() {
    //Wenn Boss besiegt wird
    if (bossHealth <= 0) {
        isBossPhase = false;
    }
    drawBackground();
    drawBossHealthbar(canvas_width - 400, 10, bossHealth, 500, 25);
    moveBoss();
    drawBoss();
    shootBossBullets();
    moveBullet();
    drawBullet();
    movePlayer();
    drawPlayer();
    checkCollision();
}

function drawBackground() {
    //Hintergrund zeichnen
    ctx.drawImage(imgBackground, background_x, background_y, background_width, background_height);
    ctx.drawImage(imgBackground, background_x + background_width - player_vel, background_y, background_width, background_height);

    //Hintergrund bewegen
    background_x -= background_vel;

    //Hintergrund zurücksetzen
    if (background_x <= 0 - background_width) {
        background_x = 0;
    }
}

function drawPlayer() {
    ctx.drawImage(imgPlayer, player_x, player_y, player_width, player_height);
}

function movePlayer() {
    if (downKey) player_y += player_vel;
    if (upKey) player_y -= player_vel;
    if (rightKey) player_x += player_vel;
    if (leftKey) player_x -= player_vel;
}

//Neue Bullets mit werten im Array abspeichern
function createBullet() {
    //Bullets dem Array hinzufügen
    console.log(bullet_changeImage);
    bullets.push({
        img: imgBullet,
        isFire: bullet_changeImage,
        width: bullet_width,
        height: bullet_height,
        x: player_x + player_width,
        y: player_y + (player_height / 2),
        vel: bullet_vel
    });
}

//Bullets zeichnen
function drawBullet() {
    if (bullets.length) {
        for (var i = 0; i < bullets.length; i++) {
            //Bulletart ändern
            if (bullets[i].isFire) { // Falls feuer
                imgBullet.src = 'src/img/fireball.png';
            } else { // Falls eis
                imgBullet.src = 'src/img/iceball.png';
            }

            ctx.drawImage(bullets[i].img, bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
        }
    }
}

//Bullets bewegen
function moveBullet() {
    for (var i = 0; i < bullets.length; i++) {
        bullets[i].x += bullets[i].vel;
    }
}

//Gegner erstellen 
function createEnemy() {
    enemy_y = ((Math.random()) * canvas_height);

    //Gegner erstellen
    enemies.push({
        img: imgEnemy,
        width: enemy_width,
        height: enemy_height,
        x: enemy_x,
        y: enemy_y,
        vel: enemy_vel
    });

    //Bullets der Gegner erstellen
    enemies_bullets.push({
        width: 50,
        height: 10,
        x: enemy_x,
        y: enemy_y + (enemy_height / 2),
        vel: 4
    });
}

//Gegner zeichnen
function drawEnemy() {
    if (enemies.length) {
        for (var i = 0; i < enemies.length; i++) {
            ctx.drawImage(enemies[i].img, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
        }
    }
}

//Gegner bewegen
function moveEnemy() {
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].x -= enemies[i].vel;
    }
}

//Gegner schiessen bullets
function shootEnemyBullet() {
    if (enemies_bullets.length) {
        for (let i = 0; i < enemies_bullets.length; i++) {
            ctx.drawImage(imgEnemyBullets, enemies_bullets[i].x, enemies_bullets[i].y, enemies_bullets[i].width, enemies_bullets[i].height);
            enemies_bullets[i].x -= enemies_bullets[i].vel;
        }
    }
}

//Bullets für den Boss erstellen
function createBossBullet() {
    if (boss_bullets.length < 3) {
        boss_bullets.push({
            width: 50,
            height: 10,
            x: boss_x,
            y: boss_y + (boss_height / 2),
            vel: 3
        });

        boss_bullets.push({
            width: 50,
            height: 10,
            x: boss_x,
            y: (boss_y + (boss_height / 2)) - 100,
            vel: 3
        });

        boss_bullets.push({
            width: 50,
            height: 10,
            x: boss_x,
            y: (boss_y + (boss_height / 2)) + 100,
            vel: 3
        });
    }
}

function shootBossBullets() {
    try {
        if (boss_bullets.length) {
            for (let i = 0; i < 3; i++) {
                ctx.drawImage(imgBossBullets, boss_bullets[i].x, boss_bullets[i].y, boss_bullets[i].width, boss_bullets[i].height);
                boss_bullets[i].x -= boss_bullets[i].vel;

                if (boss_bullets[i].x <= 0) {
                    boss_bullets.splice(i, 1);
                }
            }
        }
    } catch (error) {

    }
}

//Boss zeichnen
function drawBoss() {
    ctx.drawImage(imgBoss, boss_x, boss_y, boss_width, boss_height);
}

//Boss bewegen
function moveBoss() {
    if (bossLocation >= 0 && bossLocation <= 1) {
        boss_y = ((canvas_height - 50) - boss_height)
    } else if (bossLocation >= 1 && bossLocation <= 2) {
        boss_y = ((canvas_height / 2) - boss_height)
    } else if (bossLocation >= 2 && bossLocation <= 3) {
        boss_y = (50)
    }
}

//healthbar des Bosses zeichnen
function drawBossHealthbar(x, y, per, width, thickness) {
    ctx.beginPath();
    ctx.rect(x - width / 2, y, width * (per / 50), thickness);
    if (per > 30) {
        ctx.fillStyle = "green"
    } else if (per > 20) {
        ctx.fillStyle = "yellow"
    } else if (per > 10) {
        ctx.fillStyle = "orange";
    } else {
        ctx.fillStyle = "red";
    }
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.rect(x - width / 2, y, width, thickness);
    ctx.stroke();
}

//Punkt des Bosses verändern, falls er getroffen wird
function changeBossLocation() {
    //Bisherige Bullets löschen und neue mit neuen Koordinaten erstellen
    for (let i = 0; i < boss_bullets.length; i++) {
        boss_bullets.splice(i, 1);
    }
    createBossBullet();

    bossLocation = Math.random() * 3;
}

//Kollision von allem checken
function checkCollision() {
    //schauen, ob player wände berührt
    if (player_x <= 0) leftKey = false;
    if (player_x >= canvas_width - player_width) rightKey = false;
    if (player_y <= 0) upKey = false;
    if (player_y >= canvas_height - player_height) downKey = false;

    //Schauen, ob enemies abgeschossen werden
    if (bullets.length && enemies.length) {
        for (let i = 0; i < enemies.length; i++) {
            for (let j = 0; j < bullets.length; j++) {
                try {
                    if (bullets[j].x <= (enemies[i].x + enemies[i].width) &&
                        bullets[j].x >= enemies[i].x &&
                        bullets[j].y <= (enemies[i].y + enemies[i].height) &&
                        bullets[j].y >= enemies[i].y) {

                        //Enemy und Bullet entfernen
                        enemies[i].img.src = 'src/img/spaceship.png';
                        console.log(bullets[i].isFire);
                        enemies.splice(i, 1);
                        bullets.splice(j, 1);

                        //Score erhöhen und ausgeben
                        score++;
                        document.getElementById('score').innerHTML = 'Score: ' + score;


                        /*Einfrieren oder zerstörten, je nach Bullet
                        if (bullets[i].isFire == true) { //Falls Feuerball
                            
                        } else { //Falls Eisball
                            enemies[i].img.src = 'src/img/iceship.png';
                            bullets.splice(j, 1);
                            console.log(bullets[i].isFire);
                        }*/
                    }
                } catch (error) {
                    //Enemy und Bullet entfernen
                    enemies.splice(i, 1);
                    bullets.splice(j, 1);
                }
            }
        }
    }

    //Schauen, ob Player den Boss getroffen hat
    if (isBossPhase) {
        for (let i = 0; i < bullets.length; i++) {
            if (bullets[i].x <= (boss_x + boss_width) &&
                bullets[i].x >= boss_x &&
                bullets[i].y <= (boss_y + boss_height) &&
                bullets[i].y >= boss_y) {

                //Boss verliert HP
                bullets.splice(i, 1);
                bossHealth--;
                changeBossLocation();
            }
        }
    }

    //Schauen, ob Player abgeschossen wird
    if (enemies.length) {
        for (let i = 0; i < enemies_bullets.length; i++) {
            if (enemies_bullets[i].y <= player_y + player_height &&
                enemies_bullets[i].y >= player_y &&
                enemies_bullets[i].x <= player_x + player_width &&
                enemies_bullets[i].x >= player_x) {
                enemies_bullets.splice(i, 1);
                //Beende das Spiel
                clearInterval(intervalGameLoop);
                clearInterval(intervalCreateEnemies);
            }
        }
    }
    if (boss_bullets.length) {
        for (let i = 0; i < enemies_bullets.length; i++) {
            if (boss_bullets[i].y <= player_y + player_height &&
                boss_bullets[i].y >= player_y &&
                boss_bullets[i].x <= player_x + player_width &&
                boss_bullets[i].x >= player_x) {
                boss_bullets.splice(i, 1);
                //Beende das Spiel
                clearInterval(intervalGameLoop);
                clearInterval(intervalCreateEnemies);
            }
        }
    }

    //Löschen alles Objekte, falls sie aus dem Screen sind
    if (enemies.length && bullets.length) {
        for (let i = 0; i < enemies.length; i++) { // Bei denGegnern
            if (enemies[i].x <= (0 - enemies[i].width)) {
                enemies.splice(i, 1);
            }
        }
        for (let i = 0; i < bullets.length; i++) { // Bei den Bullets des Players
            if (bullets[i].x >= canvas_width) {
                bullets.splice(i, 1);
            }
        }
    }
}

//Keypresses erkennen
document.onkeydown = function (e) {
    //Movement
    if (e.keyCode == 39) {
        rightKey = true;
    }
    if (e.keyCode == 37) {
        leftKey = true;
    }
    if (e.keyCode == 38) {
        upKey = true;
    }
    if (e.keyCode == 40) {
        downKey = true;
    }

    //Spiel starten
    if (e.keyCode == 13 && !startGame) {
        startGame = true;
        initGame();
    } else if (e.keyCode == 13 && startGame) {
        location.reload();
    }
    //Bullet schiessen
    if (e.keyCode == 32) {
        createBullet();
    }
    //Projektil wechseln
    if (e.keyCode == 82) {
        bullet_changeImage = !bullet_changeImage;

        if (bullet_changeImage) {
            document.getElementById('fireball').style.borderColor = 'red';
            document.getElementById('iceball').style.borderColor = 'black';
        } else {
            document.getElementById('fireball').style.borderColor = 'black';
            document.getElementById('iceball').style.borderColor = 'red';
        }
    }
};

document.onkeyup = function (e) {
    if (e.keyCode == 39) {
        rightKey = false;
    }
    if (e.keyCode == 37) {
        leftKey = false;
    }
    if (e.keyCode == 38) {
        upKey = false;
    }
    if (e.keyCode == 40) {
        downKey = false;
    }
};