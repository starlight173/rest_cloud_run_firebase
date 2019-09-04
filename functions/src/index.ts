import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const app = express();
const main = express();

main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

const contactsCollection = 'contacts';

export const webApi = functions.https.onRequest(main);

interface Contact {
    firstName: String
    lastName: String
    email: String
}

app.get('/hello', async (req, res) => {
    res.send("Hello from Firebase!");
})

// Add new contact
app.post('/contacts', async (req, res) => {
    try {
        const contact: Contact = {
            firstName: req.body['firstName'],
            lastName: req.body['lastName'],
            email: req.body['email']
        }
        const newDoc = await db.collection(contactsCollection)
            .add(contact)
        res.status(201).send(`Created a new contact: ${newDoc.id}`);
    } catch (error) {
        res.status(400).send(`Contact should only contains firstName, lastName and email!!!`)
    }
})

// update contact
app.patch('/contacts/:contactId', async (req, res) => {
    const updatedContact = await db.collection(contactsCollection)
        .doc(req.params.contactId)
        .update(req.body)
    res.status(204).send(`Updated a new contact: ${updatedContact}`);
})

// View a contact
app.get('/contacts/:contactId', async (req, res) => {
    const docRef = await db.collection(contactsCollection)
        .doc(req.params.contactId)
    docRef.get()
        .then(doc => res.status(200).send(doc.data()))
        .catch(error => res.status(400).send(`Cannot get contact: ${error}`));
})

// View all contacts
app.get('/contacts', async (req, res) => {
    const data: {[index: string]: {[index: string]:{[field: string]: any}}}= {};
    data[contactsCollection] = {};
    await db.collection(contactsCollection)
        .get()
        .then(snapshot => { snapshot.forEach(doc => { data[contactsCollection][doc.id] = doc.data(); }); res.status(200).send(data); })
        .catch(error => res.status(400).send(`Cannot get contacts: ${error}`));
})

// Delete a contact 
app.delete('/contacts/:contactId', async (req, res) => {
    const deletedContact = await db.collection(contactsCollection)
        .doc(req.params.contactId)
        .delete()
    res.status(204).send(`Contact is deleted: ${deletedContact}`);

})