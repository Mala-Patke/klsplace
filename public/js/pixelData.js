/**@type {Pixel[][]} */
let pixels = [];
const pixelSize = 10;           
for(let i = 0; i < pixelSize; i++) pixels.push([]);

let uninitialized = true;

class Pixel {
    constructor(x, y, colorCode = 0) {
        this.x = x;
        this.y = y;
        this.colorCode = colorCode;   
    }

    async getRef(current = true) {
        return await Pixel.db.collection(current ? 'pixels' : 'pixelData')
            .where("x", '==', this.x)
            .where("y", '==', this.y)
            .get();
    }

    async updateColorUser(colorCode) {
        let localPixel = await this.getRef();
        await localPixel.docs[0].ref.update({colorCode});
        /*
        let localPixelData = await this.getRef(false);
        await localPixelData.docs[0].ref.update({
            colorCode: Pixel.FieldValue.arrayUnion(colorCode)
        });*/
        
        this.colorCode = colorCode;
        
        this.updateCanvas();
    }

    updateColorServer(colorCode) {        
        this.colorCode = colorCode;
        
        this.updateCanvas();
    }

    updateCanvas() {
        Pixel.ctx.fillStyle = this.localizedColorCode;
        Pixel.ctx.fillRect(this.x*10, this.y*10, 10, 10);
    }

    get localizedColorCode() {
        return Pixel.colorCodes[this.colorCode];
    }

    static db;
    static FieldValue;
    static ctx;
    static colorCodes = {
        0: 'white',
        1: 'black',
        2: 'red',
        3: 'green',
        4: 'blue'
    }
    
}

document.addEventListener('DOMContentLoaded', async () => {
    const db = firebase.firestore();

    Pixel.db = db;
    Pixel.FieldValue = firebase.firestore.FieldValue;
    Pixel.ctx = document.getElementById('pixelCanvas').getContext('2d');

    //* Create and add test data for emulator. DELETE IN PROD 
    let inc = 0
    for(let y = 0; y < 10; y++) {
        for(let x = 0; x < 10; x++) {
            await db.collection('pixels').doc(`${inc++}`).set({
                x,
                y,
                colorCode:0
            });
        }
    } //*/

    //Update pixels globally on db update
    db.collection('pixels').onSnapshot(snapshot => {
        //Initial load
        if(uninitialized) {
            uninitialized = false;

            //Load and format all pixel data
            let docArray = Array.from(snapshot.docs).sort((a, b) => parseInt(a.id) - parseInt(b.id));
            for(let doc of docArray) {
                let { x, y, colorCode } = doc.data();
                pixels[x].push(new Pixel(x, y, colorCode));
            }

            //Color pixels on canvas
            for(let row of pixels) {
                for(let pixel of row) {
                    pixel.updateCanvas();
                }
            }

            return;
        }

        //Update canvas on server change
        snapshot.docChanges().forEach(change => {
            if(snapshot.metadata.hasPendingWrites) return;

            let { x, y, colorCode } = change.doc.data();
            pixels[x][y].updateColorServer(colorCode);
        });
    });
});