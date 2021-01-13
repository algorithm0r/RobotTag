class Circle {
    constructor(game) {
        this.game = game;
        this.radius = 10;
        this.x = this.radius + Math.random() * (this.game.surfaceWidth - this.radius * 2);
        this.y = this.radius + Math.random() * (this.game.surfaceHeight - this.radius * 2);

        this.friction = 1;
        this.acceleration = 1000000;
        this.maxSpeed = 200;

        this.player = 1;
        this.visualRadius = 200;
        this.colors = ["Red", "White"];
        this.setNotIt();

        this.velocity = { x: Math.random() * 1000 - 500, y: Math.random() * 1000 - 500 };
        this.testSpeed();
    };

    testSpeed() {
        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > this.maxSpeed) {
            var ratio = this.maxSpeed / speed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
        }
    };

    setIt() {
        this.it = true;
        this.color = 0;
        this.visualRadius = 500;
        this.maxSpeed = 250;
        this.paused = 1;
    };

    setNotIt() {
        this.it = false;
        this.color = 1;
        this.visualRadius = 200;
        this.maxSpeed = 200;
    };

    collide(other) {
        return distance(this, other) < this.radius + other.radius;
    };

    collideLeft() {
        return (this.x - this.radius) < 0;
    };

    collideRight() {
        return (this.x + this.radius) > 800;
    };

    collideTop() {
        return (this.y - this.radius) < 0;
    };

    collideBottom() {
        return (this.y + this.radius) > 800;
    };

    update() {
        this.friction = document.getElementById("friction").value;
        if (this.paused > 0) {
            this.paused -= this.game.clockTick;
        } else {
            // move
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;

            // collision with left or right walls
            if (this.collideLeft() || this.collideRight()) {
                this.velocity.x = -this.velocity.x * this.friction;
                if (this.collideLeft()) this.x = this.radius;
                if (this.collideRight()) this.x = this.game.surfaceWidth - this.radius;
            }

            // collision with top or bottom walls
            if (this.collideTop() || this.collideBottom()) {
                this.velocity.y = -this.velocity.y * this.friction;
                if (this.collideTop()) this.y = this.radius;
                if (this.collideBottom()) this.y = this.game.surfaceHeight - this.radius;
            }

            // collision with other circles
            for (var i = 0; i < this.game.entities.length; i++) {
                var ent = this.game.entities[i];
                if (ent !== this && this.collide(ent)) {
                    var dist = distance(this, ent);
                    var delta = this.radius + ent.radius - dist;
                    var difX = (this.x - ent.x) / dist;
                    var difY = (this.y - ent.y) / dist;

                    this.x += difX * delta / 2;
                    this.y += difY * delta / 2;
                    ent.x -= difX * delta / 2;
                    ent.y -= difY * delta / 2;

                    // swap velocities
                    var temp = { x: this.velocity.x, y: this.velocity.y };
                    this.velocity.x = ent.velocity.x * this.friction;
                    this.velocity.y = ent.velocity.y * this.friction;
                    ent.velocity.x = temp.x * this.friction;
                    ent.velocity.y = temp.y * this.friction;

                    // play tag
                    if (this.it) {
                        this.setNotIt();
                        ent.setIt();
                    }
                }

                if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
                    var dist = distance(this, ent);
                    if (this.it && dist > this.radius + ent.radius + 10) {
                        var difX = (ent.x - this.x) / dist;
                        var difY = (ent.y - this.y) / dist;
                        this.velocity.x += difX * this.acceleration / (dist * dist);
                        this.velocity.y += difY * this.acceleration / (dist * dist);
                    }
                    if (ent.it && dist > this.radius + ent.radius) {
                        var difX = (ent.x - this.x) / dist;
                        var difY = (ent.y - this.y) / dist;
                        this.velocity.x -= difX * this.acceleration / (dist * dist);
                        this.velocity.y -= difY * this.acceleration / (dist * dist);
                    }
                }
            }

            this.testSpeed();

            this.velocity.x -= (1 - this.friction) * this.game.clockTick * this.velocity.x;
            this.velocity.y -= (1 - this.friction) * this.game.clockTick * this.velocity.y;
        }
    };

    draw(ctx) {
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.fillStyle = this.colors[this.color];
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();

        if (document.getElementById("visual").checked) {
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = this.colors[this.color];
            ctx.arc(this.x, this.y, this.visualRadius, 0, Math.PI * 2, false);
            ctx.stroke();
            ctx.closePath();
        }
    };

};
