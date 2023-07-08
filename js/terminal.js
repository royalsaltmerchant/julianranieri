import createElement from "./createElement.js";
import readFile from "./readFile.js";
import getBrowser from "./getBrowser.js";

class Terminal {
  constructor(props) {
    this.commandBuffer = [];
    this.entryElem = document.getElementById("terminal");
    this.currentDir = "/";
    this.inputElem;

    this.cmdHistory = [];
    this.currentCmdHistoryIndex = this.getCmdHistoryIndex();

    // file read data
    this.jsonFileStruct = null;

    this.init();
  }

  getHead = () => {
    let dir = this.currentDir;
    dir = dir.split("/");
    dir = dir[dir.length - 1];
    if (dir === "" || dir === " ") dir = "/";
    return `${getBrowser()}@julianranieri.com ${dir} %`;
  };

  getCmdHistoryIndex = () => {
    return this.cmdHistory.length;
  };

  init = async () => {
    // init
    // get file structure
    const jsonFileStructData = await readFile("./fileStructure.json");
    this.jsonFileStruct = JSON.parse(jsonFileStructData);
    // get ascii art
    const asciiart = await readFile("../text/asciiart.txt");
    const artlines = asciiart.split("\n");
    for (const line of artlines) {
      const firstLine = this.newLinePre(line);
      this.entryElem.appendChild(firstLine);
    }
    // get help info
    const helpinfo = await readFile("../text/helpinfo.txt");
    const helpLines = this.newLine("\n" + helpinfo);
    this.entryElem.appendChild(helpLines);
    // input line
    const inputLine = this.newInputLine();
    this.inputElem = inputLine.children[1];
    // handle event listener to focus on input line when click anywhere in terminal
    this.entryElem.addEventListener("click", () => {
      this.inputElem.focus();
    });

    // append
    this.entryElem.appendChild(inputLine);
  };

  clear = async () => {
    for (var i = this.entryElem.children.length - 1; i >= 0; i--) {
      if (this.entryElem.children[i] !== this.inputElem.parentElement) {
        this.entryElem.removeChild(this.entryElem.children[i]);
      }
    }
  };

  changeDir = async (newDir) => {
    let filePath;

    if (!newDir) {
      filePath = "/";
    } else {
      if (newDir.startsWith("/")) {
        filePath = newDir;
      } else if (newDir.startsWith("./")) {
        const pathWithoutPrefix = newDir.substring(2);
        filePath = `${
          this.currentDir === "/" ? "" : this.currentDir
        }/${pathWithoutPrefix}`;
      } else if (newDir === "..") {
        const lastSlashIndex = this.currentDir.lastIndexOf("/");
        this.currentDir = this.currentDir.substring(0, lastSlashIndex);
        filePath = this.currentDir === "" ? "/" : this.currentDir;
      } else if (newDir.startsWith("../")) {
        let pathWithoutPrefix = newDir;
        while (pathWithoutPrefix.startsWith("../")) {
          this.currentDir = this.currentDir.substring(
            0,
            this.currentDir.lastIndexOf("/")
          );
          pathWithoutPrefix = pathWithoutPrefix.substring(3);
        }
        filePath = `${
          this.currentDir === "/" ? "" : this.currentDir
        }/${pathWithoutPrefix}`;
      } else if (newDir === ".") {
        return;
      } else {
        filePath = `${
          this.currentDir === "/" ? "" : this.currentDir
        }/${newDir}`;
      }
    }

    const list = this.findChildrenNames(this.jsonFileStruct, filePath);

    if (!list) return;
    if (filePath === "" || filePath == " ") {
      filePath = "/";
    }
    console.log(filePath);
    this.currentDir = filePath;

    // update head
    const inputHead = document.getElementById("input-head");
    inputHead.innerText = this.getHead();
  };

  findChildrenNames = (directoryModel, absolutePath) => {
    if (absolutePath === "/") {
      return directoryModel.children.map((child) => child.name);
    }

    const pathSegments = absolutePath
      .split("/")
      .filter((segment) => segment !== "");
    let currentDirectory = directoryModel;

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const childDirectory = currentDirectory.children.find(
        (child) => child.name === segment && child.type === "directory"
      );

      if (!childDirectory) {
        return null; // Directory not found
      }

      currentDirectory = childDirectory;
    }

    return currentDirectory.children.map((child) => child.name);
  };

  handleList = async () => {
    const list = this.findChildrenNames(this.jsonFileStruct, this.currentDir);

    for (const item of list) {
      const inputLine = this.newLine(item);
      this.entryElem.insertBefore(inputLine, this.inputElem.parentElement);
    }
  };

  handleCat = async (fileLocation) => {
    if (!fileLocation) return;

    let filePath;

    if (fileLocation.startsWith("/")) {
      filePath = fileLocation;
    } else if (fileLocation.startsWith("./")) {
      const pathWithoutPrefix = fileLocation.substring(2);
      filePath = this.currentDir + "/" + pathWithoutPrefix;
    } else if (fileLocation.startsWith("../")) {
      let pathWithoutPrefix = fileLocation;
      while (pathWithoutPrefix.startsWith("../")) {
        this.currentDir = this.currentDir.substring(
          0,
          this.currentDir.lastIndexOf("/")
        );
        pathWithoutPrefix = pathWithoutPrefix.substring(3);
      }
      filePath = this.currentDir + "/" + pathWithoutPrefix;
    } else {
      filePath = this.currentDir + "/" + fileLocation;
    }
    filePath = filePath.replace(/\/\//g, "");

    const fileText = await readFile(filePath);
    const inputLine = this.newLine("\n" + fileText);
    this.entryElem.insertBefore(inputLine, this.inputElem.parentElement);
  };
  handleArgs = async (args) => {
    const command = args[0];
    if (!command) return;
    let inputLine;

    switch (command) {
      case "pwd":
        inputLine = this.newLine(this.currentDir);
        this.entryElem.insertBefore(inputLine, this.inputElem.parentElement);
        break;
      case "ls":
        this.handleList();
        break;
      case "cd":
        this.changeDir(args[1]);
        break;
      case "clear":
        this.clear();
        break;
      case "cat":
        this.handleCat(args[1]);
        break;
      case "help":
        const helpinfo = await readFile("../text/helpinfo.txt");
        const helpLines = this.newLine("\n" + helpinfo);
        this.entryElem.insertBefore(helpLines, this.inputElem.parentElement);
        break;
      default:
        inputLine = this.newLine(`Command not found: ${command}`);
        this.entryElem.insertBefore(inputLine, this.inputElem.parentElement);
    }
  };

  handleEnter = (e) => {
    e.preventDefault();
    let inputText = e.target.innerText;
    inputText = inputText.trim();

    // push to history
    this.cmdHistory.push(inputText);
    // update current cmd history index
    this.currentCmdHistoryIndex = this.getCmdHistoryIndex();

    // handle new line
    const inputLine = this.newLine(inputText);
    this.entryElem.insertBefore(inputLine, this.inputElem.parentElement);
    // clear
    e.target.innerText = "";

    // handle args
    const args = inputText.split(" ").map((item) => {
      return item.trim();
    });
    this.handleArgs(args);

    // scroll to bottom
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 100);
  };

  handleTermInput = (e) => {
    switch (e.key) {
      case "Enter":
        this.handleEnter(e);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (this.currentCmdHistoryIndex > 0) {
          this.currentCmdHistoryIndex = this.currentCmdHistoryIndex - 1;
          const prevCommand = this.cmdHistory[this.currentCmdHistoryIndex];
          if (prevCommand) this.inputElem.innerText = prevCommand;
        }
        break;
      case "ArrowDown":
        if (this.currentCmdHistoryIndex < this.getCmdHistoryIndex()) {
          e.preventDefault();
          this.currentCmdHistoryIndex = this.currentCmdHistoryIndex + 1;
          const nextCommand = this.cmdHistory[this.currentCmdHistoryIndex];
          if (nextCommand) this.inputElem.innerText = nextCommand;
        }
        break;
    }
  };

  newLinePre = (text) => {
    const elem = createElement("div", { class: "term-line-container" }, [
      createElement("div", { class: "term-head" }, this.getHead()),
      createElement(
        "pre",
        { style: "display: inline; margin-left: 5px;" },
        text
      ),
    ]);

    return elem;
  };

  newLine = (text) => {
    const elem = createElement("div", { class: "term-line-container" }, [
      createElement("div", { class: "term-head" }, this.getHead()),
      createElement(
        "div",
        { style: "display: inline; margin-left: 5px; white-space: pre-wrap;" },
        text
      ),
    ]);

    return elem;
  };

  newInputLine = () => {
    return createElement("div", { class: "term-line-container" }, [
      createElement(
        "div",
        { class: "term-head", id: "input-head" },
        this.getHead()
      ),
      createElement(
        "div",
        {
          class: "term-input",
          id: "term-input",
          contentEditable: "true",
          spellcheck: "false",
          autofocus: "true",
          style: "margin-left: 5px",
        },
        null,
        [
          {
            type: "keydown",
            event: this.handleTermInput,
          },
          {
            type: "paste",
            event: (e) => {
              e.preventDefault();
              var text = e.clipboardData.getData("text/plain");
              text = text.replace(/[\r\n]+/g, ""); // Remove line breaks
              document.execCommand("insertText", false, text);
            },
          },
        ]
      ),
    ]);
  };
}

new Terminal({});
