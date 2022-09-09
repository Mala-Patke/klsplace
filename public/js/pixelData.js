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
        return await Pixel.db.collection(current ? 'pixels' : 'pixeldata')
            .where("x", '==', this.x)
            .where("y", '==', this.y)
            .get();
    }

    async updateColorUser(colorCode) {
        let localPixel = await this.getRef();
        await localPixel.docs[0].ref.update({colorCode});
        
        let localPixelData = await this.getRef(false);
        await localPixelData.docs[0].ref.update({
            prevColorCodes: Pixel.FieldValue.arrayUnion(colorCode),
            prevUsers: Pixel.FieldValue.arrayUnion($('#username').text()),
        });
        
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
    static colorCodes = [
        'white',
        'black',
        'red',
        'green',
        'blue'
    ]
}

function cButtonOnClick({ target }) {
    $('.cbutton')
        .removeClass('selected');
    $(target)
        .addClass('selected');
}

function placePixel() {
    let color = $('.selected').attr('code');
    let { x, y } = currentRectangle;
    let pixel = pixels[x][y];
    
    console.log(pixel, currentRectangle);
    pixel.updateColorUser(color);
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM Content loaded!")
    //Init
    const db = firebase.firestore();
    Pixel.db = db;
    Pixel.FieldValue = firebase.firestore.FieldValue;
    Pixel.ctx = document.getElementById('pixelCanvas').getContext('2d');

    //Create color buttons
    for(let code in Pixel.colorCodes) {
        $(document.createElement('button'))
            .addClass('cbutton')
            .attr('code', code)
            .css('background-color', Pixel.colorCodes[code])
            .on('click', cButtonOnClick)
            .appendTo('#colors')
    }

    /* Create and add test data for emulator. DELETE IN PROD 
    let inc = -1;
    for(let y = 0; y < 10; y++) {
        for(let x = 0; x < 10; x++) {
            console.log(x, y);
            await db.collection('pixels').doc(`${++inc}`).set({
                x,
                y,
                colorCode:0
            });

            await db.collection('pixeldata').doc(`${inc}`).set({
                x,
                y,
                prevColorCodes: [],
                prevUsers: []
            });
        }
    } //*/

    //Initialize pixel data locally and sort
    let docArray = await db.collection('pixels').get();
    docArray.forEach(doc => {
        let { x, y, colorCode } = doc.data();
        pixels[x].push(new Pixel(x, y, colorCode));
    });
    for(let pixel of pixels) {
        pixel.sort((a,b) => a.y - b.y);
    }

    //Update pixels globally on db update
    db.collection('pixels').onSnapshot(snapshot => {
        //Update canvas on server change
        snapshot.docChanges().forEach(change => {
            if(snapshot.metadata.hasPendingWrites) return;

            let { x, y, colorCode } = change.doc.data();
            pixels[x][y].updateColorServer(colorCode);
        });
    });
});