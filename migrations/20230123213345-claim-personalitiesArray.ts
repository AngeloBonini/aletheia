import { Db } from "mongodb";

export async function up(db: Db) {
    /*  if there was no personality field, create an empty array
     if there was a personality field, but it was not an array, make it an array
     if there was a personality field, and it was an array, rename it to personalities */
    const claimsCursor = await db.collection("claims").find();
    while (await claimsCursor.hasNext()) {
        const doc = await claimsCursor.next();
        if (doc.personality === null) {
            await db
                .collection("claims")
                .updateOne(
                    { _id: doc._id },
                    { $set: { personalities: [] }, $unset: { personality: 1 } }
                );
        } else if (!Array.isArray(doc.personality)) {
            await db.collection("claims").updateOne(
                { _id: doc._id },
                {
                    $set: { personalities: [doc.personality] },
                    $unset: { personality: 1 },
                }
            );
        } else {
            await db
                .collection("claims")
                .updateOne(
                    { _id: doc._id },
                    { $rename: { personality: "personalities" } }
                );
        }
    }
}

export async function down(db: Db) {
    /*  if it was an empty array, remove it
        if it was an array with one element, remove the array and rename the field to personality
        if it was an array with more than one element, rename the field to personality
    */
    const claimsCursor = await db.collection("claims").find();
    while (await claimsCursor.hasNext()) {
        const doc = await claimsCursor.next();
        if (doc.personalities.length === 0) {
            await db.collection("claims").updateOne(
                { _id: doc },
                {
                    $unset: { personalities: 1 },
                    $set: { personality: null },
                }
            );
        } else if (doc.personalities.length === 1) {
            await db.collection("claims").updateOne(
                { _id: doc._id },
                {
                    $set: { personality: doc.personalities[0] },
                    $unset: { personalities: 1 },
                }
            );
        } else {
            await db.collection("claims").updateOne(
                { _id: doc._id },
                {
                    $rename: { personalities: "personality" },
                }
            );
        }
    }
}
