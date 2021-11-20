(() => {
  const container = document.querySelector('.container');

  // центрировать конейнер
  function setContainerWidth() {
    const heightCont = container.offsetHeight;
    const widthCont = heightCont - 160;
    container.style.width = `${widthCont}px`;
  }

  // очистить содержимое элемента
  function clear(elem) {
    elem.innerHTML = '';
  }

  // создание формы запроса на количество элементов

  function createForm() {
    const form = document.createElement('form');
    const title = document.createElement('p');
    const input = document.createElement('input');
    const btnSubmit = document.createElement('button');

    form.classList.add('form');

    input.type = 'text';
    input.classList.add('input');

    title.classList.add('title');
    title.textContent = 'Кол-во карточек по вертикали/горизонтали';

    btnSubmit.type = 'submit';
    btnSubmit.textContent = 'Начать игру';
    btnSubmit.classList.add('btn', 'btn-submit');

    container.append(form);
    form.append(title);
    form.append(input);
    form.append(btnSubmit);

    return {
      form,
      title,
      input,
      btnSubmit,
    };
  }

  // создание сетки для карточек
  function createGrid(num) {
    const grid = document.createElement('ul');
    grid.classList.add('grid');
    grid.style.setProperty('--grid-rows', num);
    grid.style.setProperty('--grid-cols', num);
    return grid;
  }

  // создание карточки
  function createCard(content) {
    const item = document.createElement('li');
    const inner = document.createElement('div');

    item.classList.add('card', 'flex-all-center', 'card-in-game');
    inner.classList.add('inner', 'flex-all-center');
    inner.textContent = content;

    item.append(inner);

    return {
      item,
      inner,
    };
  }

  // определение карточек
  function determineCards() {
    const cardsAll = document.querySelectorAll('.card-in-game');
    const cardsNum = Math.sqrt(cardsAll.length);
    return {
      cardsAll,
      cardsNum,
    };
  }

  // добавление карточек в сетку
  function addCards(list, num, arr) {
    for (let i = 1; i <= num ** 2; i++) {
      const cardItem = (createCard(arr[i - 1]));
      list.append(cardItem.item);
    }

    const cards = determineCards().cardsAll;
    const inners = document.querySelectorAll('.inner');

    const cardWidth = document.querySelector('.inner').offsetWidth;
    const cardHeight = cardWidth;

    cards.forEach((el) => {
      el.style.height = `${cardHeight}px`;
    });

    inners.forEach((el) => {
      el.style.fontSize = `${cardHeight / 2}px`;
    });
  }

  // сгенерировать массив номеров
  function generateArr(num) {
    const arr = [];
    let i = 1;
    const l = num ** 2 / 2;
    while (arr.push(i++) < l);
    while (--i) {
      arr.splice(i - 1, 0, arr[i - 1]);
    }

    let n = num ** 2;
    const temp = [];
    let j;
    while (n--) {
      j = Math.floor(Math.random() * (n + 1));
      temp.push(arr[j]);
      arr.splice(j, 1);
    }
    return temp;
  }

  // вывести сообщение по окончании игры

  function gameOver(text) {
    const gameOverMessage = document.createElement('div');
    container.append(gameOverMessage);
    gameOverMessage.classList.add('game-over');
    gameOverMessage.textContent = text;
  }

  // запустить игру
  function runGame() {
    const cards = determineCards().cardsAll;
    const num = determineCards().cardsNum;
    let firstCard = false;
    let secondCard = false;
    let check = 1;

    // создать таймер
    let timer;

    function stopTimer() {
      clearInterval(timer);
    }

    function getCounter(item) {
      let itemNew = item;
      return function () {
        return --itemNew;
      };
    }

    // добавить кнопку перезапуска игры
    function restart() {
      function reload() {
        window.location.reload();
      }

      const btnRestart = document.createElement('btn');
      btnRestart.classList.add('btn', 'btn-restart');
      btnRestart.textContent = 'Сыграть ещё раз';
      container.append(btnRestart);
      btnRestart.addEventListener('click', reload);
    }

    // счётчик открытых карт
    const countMatch = getCounter(num ** 2 / 2);

    // проверка на совпадение открытых карточек
    function checkForMatch() {
      if (firstCard.textContent === secondCard.textContent) {
        firstCard.classList.remove('card-in-game');
        secondCard.classList.remove('card-in-game');
        const cardsLeft = countMatch();
        if (cardsLeft === 0) {
          stopTimer();
          gameOver('Вы выиграли :)');
          restart();
        }
      }
    }

    // повернуть карточку содержиммым вверх
    function flipCard() {
      this.classList.add('flip');
      this.removeEventListener('click', flipCard);
      const checkedCard = this;

      // повернуть карточки рубашкой вверх
      function unflipCards() {
        const cardInGame = determineCards().cardsAll;
        cardInGame.forEach((el) => {
          el.classList.remove('flip');
          el.addEventListener('click', flipCard);
        });
        firstCard = false;
        secondCard = false;
      }

      function compareCards() {
        switch (check) {
          case 1:
            check++;
            firstCard = checkedCard;
            break;
          case 2:
            check = 1;
            secondCard = checkedCard;
            checkForMatch();
            setTimeout(unflipCards, 500);
            break;
          default:
            // do nothing;
        }
      }
      compareCards();
    }

    // поведение карточки при клике
    cards.forEach((el) => {
      el.addEventListener('click', flipCard);
    });

    (() => {
      const timeDisplay = document.createElement('div');
      timeDisplay.classList.add('timer', 'flex-all-center');
      let timeOut = 60;
      const delayTimer = 1000;

      container.prepend(timeDisplay);
      timeDisplay.textContent = timeOut;

      function startTimer() {
        --timeOut;

        if (timeOut < 0) {
          stopTimer();
          gameOver('Время истекло :(');
          cards.forEach((el) => {
            el.removeEventListener('click', flipCard);
          });
          restart();
          return;
        }
        timeDisplay.textContent = timeOut;
      }
      timer = setInterval(startTimer, delayTimer);
    })();
  }

  function checkNum(value) {
    const valueDefault = 4;
    const valueSet = (value >= 2 && value <= 10 && value % 2 === 0) ? value : valueDefault;

    return function () {
      const valueNew = valueSet;
      return valueNew;
    };
  }

  // отрисовать и запустить приложение

  function runPairsApp(numberCards) {
    clear(container);
    setContainerWidth();

    const pairsGrid = createGrid(numberCards);
    container.append(pairsGrid);

    const arrCards = generateArr(numberCards);
    addCards(pairsGrid, numberCards, arrCards);
    runGame();
  }

  function createPairsApp() {
    clear(container);
    const pairsForm = createForm();

    container.append(pairsForm.form);

    pairsForm.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const num = checkNum(pairsForm.input.value)();
      runPairsApp(num);
    });
  }

  window.createPairsApp = createPairsApp;
})();
