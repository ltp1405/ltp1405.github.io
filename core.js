"use strict";
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Boundary {
    constructor(position, width, height) {
        this.position = position;
        this.width = width;
        this.height = height;
    }
    contain(p) {
        if (this.position.x <= p.x && this.position.y <= p.y &&
            this.position.x + this.width > p.x && this.position.y + this.height > p.y) {
            return true;
        }
        return false;
    }
}
class QNode {
    constructor(bound, point_list, capacity) {
        this.nw = null;
        this.ne = null;
        this.sw = null;
        this.se = null;
        this.bound = bound;
        this.point_list = point_list;
        this.capacity = capacity;
        this.nw = null;
        this.ne = null;
        this.sw = null;
        this.se = null;
    }
    insert(p) {
        if (!this.bound.contain(p)) {
            return false;
        }
        if (this.point_list.length < this.capacity && this.nw == null) {
            this.point_list.push(p);
            return true;
        }
        if (!this.nw) {
            this.subdivide();
        }
        if (this.nw && this.nw.insert(p)) {
            return true;
        }
        if (this.ne && this.ne.insert(p)) {
            return true;
        }
        if (this.sw && this.sw.insert(p)) {
            return true;
        }
        if (this.se && this.se.insert(p)) {
            return true;
        }
        return false;
    }
    subdivide() {
        const nw_points = [];
        const ne_points = [];
        const sw_points = [];
        const se_points = [];
        const half_width = this.bound.width / 2;
        const half_height = this.bound.height / 2;
        const nw_pos = new Point(this.bound.position.x, this.bound.position.y);
        const ne_pos = new Point(this.bound.position.x + half_width, this.bound.position.y);
        const sw_pos = new Point(this.bound.position.x, this.bound.position.y + half_height);
        const se_pos = new Point(this.bound.position.x + half_width, this.bound.position.y + half_height);
        const nw_bound = new Boundary(nw_pos, half_width, half_height);
        const ne_bound = new Boundary(ne_pos, half_width, half_height);
        const se_bound = new Boundary(se_pos, half_width, half_height);
        const sw_bound = new Boundary(sw_pos, half_width, half_height);
        this.point_list.map((p) => {
            if (nw_bound.contain(p)) {
                nw_points.push(p);
            }
            else if (ne_bound.contain(p)) {
                ne_points.push(p);
            }
            else if (se_bound.contain(p)) {
                se_points.push(p);
            }
            else if (sw_bound.contain(p)) {
                sw_points.push(p);
            }
        });
        this.nw = new QNode(nw_bound, nw_points, this.capacity);
        this.ne = new QNode(ne_bound, ne_points, this.capacity);
        this.se = new QNode(se_bound, se_points, this.capacity);
        this.sw = new QNode(sw_bound, sw_points, this.capacity);
    }
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
class App {
    constructor() {
        this.CELL_SIZE = 16;
        this.width = 1024 / this.CELL_SIZE;
        this.height = 1024 / this.CELL_SIZE;
        this.points = [];
        this.qtree = null;
        this.capacity = 4;
        for (let i = 0; i < 123; i++) {
            const x = getRandomInt(this.width);
            const y = getRandomInt(this.height);
            this.addPoint(x, y);
        }
        this.updateTree();
        const c = document.getElementById("myCanvas");
        this.canvasCtx = c.getContext("2d");
        this.addEvent();
        this.draw();
        this.setCapacityText();
    }
    updateTree() {
        const bound = new Boundary(new Point(0, 0), this.width, this.height);
        const qtree = new QNode(bound, [], this.capacity);
        this.points.map((p) => {
            qtree.insert(p);
        });
        this.qtree = qtree;
    }
    setCapacityText() {
        const capacityText = document.getElementById("CapacityDisplay");
        if (capacityText) {
            capacityText.innerHTML = this.capacity.toString();
        }
    }
    addEvent() {
        const c = document.getElementById("myCanvas");
        const add_btn = document.getElementById("AddButton");
        const sub_btn = document.getElementById("SubButton");
        add_btn === null || add_btn === void 0 ? void 0 : add_btn.addEventListener("click", () => {
            this.capacity++;
            this.setCapacityText();
            this.updateTree();
            this.draw();
        });
        sub_btn === null || sub_btn === void 0 ? void 0 : sub_btn.addEventListener("click", () => {
            if (this.capacity <= 1) {
                return;
            }
            this.capacity--;
            this.setCapacityText();
            this.updateTree();
            this.draw();
        });
        c.addEventListener("mouseup", (event) => {
            const canvasTop = c.offsetTop + c.clientTop;
            const canvasLeft = c.offsetLeft + c.clientLeft;
            const x = event.pageX - canvasLeft;
            const y = event.pageY - canvasTop;
            const pos = this.mapToGridCoord(x, y);
            const pIndex = this.getPointAt(pos[0], pos[1]);
            if (pIndex == -1) {
                this.addPoint(pos[0], pos[1]);
            }
            else {
                this.points.splice(pIndex, 1);
            }
            this.updateTree();
            this.draw();
        });
    }
    mapToGridCoord(realX, realY) {
        return [
            Math.floor(realX / this.CELL_SIZE),
            Math.floor(realY / this.CELL_SIZE),
        ];
    }
    addPoint(x, y) {
        this.points.push(new Point(x, y));
    }
    draw() {
        if (!this.canvasCtx) {
            return;
        }
        this.canvasCtx.fillStyle = "#000000";
        this.canvasCtx.clearRect(0, 0, this.width * this.CELL_SIZE, this.height * this.CELL_SIZE);
        this.canvasCtx.fillStyle = "ffffff";
        this.drawGrid();
        this.drawPoints();
        this.drawTree(this.qtree);
    }
    drawPoints() {
        this.points.map((el) => {
            if (!this.canvasCtx) {
                return;
            }
            this.canvasCtx.fillRect(el.x * this.CELL_SIZE, el.y * this.CELL_SIZE, this.CELL_SIZE, this.CELL_SIZE);
        });
    }
    drawTree(qtree, depth = 0) {
        if (qtree == null || this.canvasCtx == null) {
            return;
        }
        const rect = [
            Math.round(qtree.bound.position.x) * this.CELL_SIZE,
            Math.round(qtree.bound.position.y) * this.CELL_SIZE,
            Math.round(qtree.bound.width) * this.CELL_SIZE,
            Math.round(qtree.bound.height) * this.CELL_SIZE,
        ];
        this.canvasCtx.strokeStyle = "#000000";
        this.canvasCtx.strokeRect(rect[0], rect[1], rect[2], rect[3]);
        this.drawTree(qtree.ne, depth + 1);
        this.drawTree(qtree.nw, depth + 1);
        this.drawTree(qtree.se, depth + 1);
        this.drawTree(qtree.sw, depth + 1);
    }
    getPointAt(x, y) {
        for (let i = 0; i < this.points.length; i++) {
            const p = this.points[i];
            if (p.x == x && p.y == y) {
                return i;
            }
        }
        return -1;
    }
    drawGrid() {
        if (!this.canvasCtx) {
            return;
        }
        this.canvasCtx.beginPath();
        this.canvasCtx.strokeStyle = "#e6e6e6";
        for (let i = 0; i < this.width; i++) {
            this.canvasCtx.moveTo(0, i * this.CELL_SIZE);
            this.canvasCtx.lineTo(this.width * this.CELL_SIZE, i * this.CELL_SIZE);
            this.canvasCtx.stroke();
        }
        for (let i = 0; i < this.height; i++) {
            this.canvasCtx.moveTo(i * this.CELL_SIZE, 0);
            this.canvasCtx.lineTo(i * this.CELL_SIZE, this.height * this.CELL_SIZE);
            this.canvasCtx.stroke();
        }
    }
}
function main() {
    const app = new App();
}
main();
