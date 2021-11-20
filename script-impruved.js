// MODEL //

const container = document.querySelector('.container');
const GAME_STATE = {
  NO_CARD_OPEN: 'no_card_open',
  ONE_CARD_OPEN: 'one_card_open',
  GAME_FINISH: 'game_finish',
};
let gameCurrentState = GAME_STATE.NO_CARD_OPEN;
let firstCard;
let secondCard;

// определить размер игрового поля
function getGameFieldSize(size = 4) {
  const sizeAdj = (size >= 2 && size <= 10 && size % 2 === 0) ? size : 4;

  return sizeAdj;
}

// генерировать массив карточек
function generateCards(size) {
  const cards = [];
  const maxValue = Math.round((size ** 2) / 2);

  for (let value = 1; value <= maxValue; value++) {
    cards.push({ value, isOpen: false });
    cards.push({ value, isOpen: false });
  }

  // перемешать карточки
  function shuffleCards(arr) {
    let num = arr.length;
    const temp = [];
    while (num--) {
      const item = Math.floor(Math.random() * (num + 1));
      temp.push(arr[item]);
      arr.splice(item, 1);
    }
    return temp;
  }
  return shuffleCards(cards);
}

// создание формы запроса на количество элементов

function createGameStartForm() {
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

function clear(elem) {
  elem.innerHTML = '';
}

// создание карточки
function createCard(field, content) {
  const outer = document.createElement('li');
  const inner = document.createElement('div');

  outer.classList.add('card', 'flex-all-center', 'card-in-game');
  inner.classList.add('inner', 'flex-all-center');
  inner.textContent = content;

  field.append(outer);
  outer.append(inner);

  return {
    outer,
    inner,
  };
}

// создание сетки для карточек
function createGameField(size, items) {
  clear(container);

  // центрировать конейнер
  const heightCont = container.offsetHeight;
  const widthCont = heightCont - 160;
  container.style.width = `${widthCont}px`;

  // создать сетку под карточки
  const grid = document.createElement('ul');
  grid.classList.add('grid');
  grid.style.setProperty('--grid-rows', size);
  grid.style.setProperty('--grid-cols', size);

  container.append(grid);

  // добавить карточки
  for (const item of items) {
    createCard(grid, item.value);
  }

  const cardWidth = document.querySelector('.inner').offsetWidth;
  const cardHeight = cardWidth;
  const cards = document.querySelectorAll('.card');
  const inners = document.querySelectorAll('.inner');

  cards.forEach((el) => {
    el.style.height = `${cardHeight}px`;
  });

  inners.forEach((el) => {
    el.style.fontSize = `${cardHeight / 2}px`;
  });
}

function runGame(fieldSize) {
  const cards = generateCards(fieldSize);
  let timer;

  createGameField(fieldSize, cards);

  function stopTimer() {
    clearInterval(timer);
  }

  function changeFlag(clickedElement) {
    const index = [...document.querySelectorAll('.card')]
      .indexOf(clickedElement);
    const card = cards[index];
    card.isOpen = true;
  }

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

  function handleCardClick() {
    function flipCard(card) {
      card.classList.add('flip');
      card.removeEventListener('click', handleCardClick);
    }

    function unflipCard(card) {
      card.classList.remove('flip');
      card.addEventListener('click', handleCardClick);
    }

    function gameFinish() {
      stopTimer();
      const gameOverMessage = document.createElement('div');
      container.append(gameOverMessage);
      gameOverMessage.classList.add('game-over');
      gameOverMessage.textContent = 'Вы выиграли :)';
      restart();
    }

    function isAllCardOpened() {
      let count = 0;
      let allOpened = false;
      for (const card of cards) {
        if (card.isOpen) count++;
      }
      if (count === cards.length) {
        gameCurrentState = GAME_STATE.GAME_FINISH;
        allOpened = true;
      } else {
        gameCurrentState = GAME_STATE.NO_CARD_OPEN;
      }
      return allOpened;
    }

    switch (gameCurrentState) {
      case GAME_STATE.NO_CARD_OPEN:
        flipCard(this);
        firstCard = this;
        gameCurrentState = GAME_STATE.ONE_CARD_OPEN;
        break;
      case GAME_STATE.ONE_CARD_OPEN:
        flipCard(this);
        secondCard = this;
        if (firstCard.textContent === secondCard.textContent) {
          changeFlag(firstCard);
          changeFlag(secondCard);
          firstCard = '';
          secondCard = '';
          if (isAllCardOpened()) gameFinish();
        } else {
          setTimeout(unflipCard, 300, firstCard);
          setTimeout(unflipCard, 300, secondCard);

          firstCard = '';
          secondCard = '';
          gameCurrentState = GAME_STATE.NO_CARD_OPEN;
        }
        break;
      case GAME_STATE.GAME_FINISH:
        break;
      default:
        break;
    }
  }

  const cardsHtml = document.querySelectorAll('.card');
  cardsHtml.forEach((el) => {
    el.addEventListener('click', handleCardClick);
  });

  function gameOver() {
    stopTimer();
    const gameOverMessage = document.createElement('div');
    container.append(gameOverMessage);
    gameOverMessage.classList.add('game-over');
    gameOverMessage.textContent = 'Время истекло :(';
    cardsHtml.forEach((el) => {
      el.removeEventListener('click', handleCardClick);
    });
    restart();
  }

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
        gameOver();
        return;
      }
      timeDisplay.textContent = timeOut;
    }
    timer = setInterval(startTimer, delayTimer);
  })();
}

function createPairsApp() {
  clear(container);
  const gameStartForm = createGameStartForm();

  container.append(gameStartForm.form);

  gameStartForm.form.addEventListener('submit', (e) => {
    e.preventDefault();
    runGame(getGameFieldSize(gameStartForm.input.value));
  });
}

window.createPairsApp = createPairsApp;
