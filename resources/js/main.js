class menuElement {
    constructor(href, text) {
        this.href = href;
        this.text = text;
    }
}

function fillTopics() {
    var topics = document.getElementById("topicItems");

    var a = Array.from(menuItems).forEach(e => topics.append(createMenuElement(e.href, e.text)))
}

function createMenuElement(href, text) {
    var e = document.createElement("li");
    var a = document.createElement("a");

    a.href = href;
    a.innerText = text;
    e.append(a);

    return e;
}

var menuItems = [
    new menuElement("./docs.html", "Getting started"),
    new menuElement("./simpleusage.html", "Simple usage")
];

fillTopics();
