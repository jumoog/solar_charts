const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const loki = require("lokijs");
const db = new loki('loki.json');
const csv = require("csvtojson");
const values = db.addCollection('values');

app.use(express.static('public'));
app.use('/favicon.ico', express.static('public/favicon.ico'));

app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

csv({
		noheader: false,
		delimiter: ";",
		checkType: true,
		ignoreEmpty: true,
		eol: "\n",
		ignoreColumns: /Description/,
		headers: ["Date", "Time", "Inverter No.", "Device Type", "Periode [s]", "Energy positiv [Ws]", "Reactive Energy L[Vars]", "Reactive Energy C[Vars]", "Uac L1 [V]", "Uac L2 [V]", "Uac L3 [V]", "Iac L1 [A]", "Iac L2 [A]", "Iac L3 [A]", "Udc MPPT1[V]", "Idc MPPT1[A]", "Udc MPPT2[V]", "Idc MPPT2[A]", "Description"]
	})
	.fromFile("DATA.CSV")
	.then((jsonObj) => {
		console.log("Indexd " + jsonObj.length + " values");
		for (let i = 1; i < jsonObj.length; i++) {
			values.insert(jsonObj[i]);
		};
		db.saveDatabase();
	})

db.loadDatabase({}, function () {
	http.listen(3000, function () {
		console.log('listening on *:3000')
	});
});

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html')
});

app.get('/data', function (req, res) {
	let values = db.getCollection('children')
	res.send(JSON.stringify(values.find({
		Date: {
			'$between': [req.query.start, req.query.end]
		}
	})))
})