import { getFirestore, doc, setDoc } from "firebase/firestore";
import app from "./fbapp.js";

const SIZE = 10;
const db = getFirestore(app);

(async() => {
    try {
        let inc = 0;
        for(let y = 0; y < SIZE; y++) {
            for(let x = 0; x < SIZE; x++) {
                await setDoc(doc(db, "pixels", `${inc++}`), {
                    x,
                    y,
                    colorCode: 0
                });
                console.log(`Doc ${inc} initialized`);
            }
        }
    } catch(e) {
        console.error(e);
    }
})();