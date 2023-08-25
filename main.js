(()=>{
    //Изменение высоты и размера шрифта блоков относительно размера экрана
    window.addEventListener('resize', resizeHeightCard);
    function resizeHeightCard(){
        const cardWidth = getComputedStyle(document.querySelector('.card')).width;
        document.querySelectorAll('.card').forEach(item => {
            item.style.height = cardWidth;
            item.style.fontSize = `${cardWidth.split('px')[0] / 2}px`;
        });
    };

    document.addEventListener('DOMContentLoaded', ()=>{
        //Создание контейнера
        document.body.append(container);
        //Вызов модального окна
        createModal()
    });

    //Создание заголовков
    function createAppTitle(title, resize) {
        const appTitle = document.createElement(resize);
        appTitle.classList.add(resize);
        appTitle.innerHTML = title;
        return appTitle;
    }

    //открытие карточек 
    function cardFlip(event){
        const card = event.currentTarget;
        if(!card.classList.contains('card--active')){
            card.classList.add('card--active-animIn');
            card.classList.add('card--active');
            setTimeout(()=>{
                card.classList.remove('card--active-animIn'); 
            }, 400);
            checkingСards();
        }
    };

    //Игровые таймеры
    let playTime;
    let remainingTime;

    //Игровое время
    function gameTime(){
        playTime = window.setTimeout(()=>{
            document.querySelectorAll('.card')
                .forEach(item =>
                    item.removeEventListener('click', cardFlip)
                );
            restartGame();
        }, 61*1e3);

        let timer = 60;
        const timerTitle = createAppTitle('Оставшееся время: 60', 'h2');
        remainingTime = window.setInterval(()=>{
            --timer;
            timerTitle.textContent = `Оставшееся время: ${timer}`;
        }, 1e3)

        container?.querySelector('.h1').after(timerTitle);
    }

    //Создание радиокнопок
    function createRadioInput(count = [2]){
        const inputArr = document.createElement('div');
        inputArr.classList.add('form-inputs', 'mb-3');
        for(let i = 0; i !== count.length; i++){
            const div = document.createElement('div');
            const input = document.createElement('input');
            const label = document.createElement('label');

            div.classList.add('form-check', 'form-check-inline');
            input.classList.add('form-check-input');
            label.classList.add('form-check-label');

            input.id = `formRadio_${count[i]}x${count[i]}`;
            input.type = 'radio'
            input.name = "sizeBoard"
            input.value = count[i];
            label.for = input.id;
            label.textContent = `${count[i]}x${count[i]}`;

            div.append(input);
            div.append(label);
            inputArr.append(div);

            i === 0
                ? input.setAttribute('checked', 'checked')
                : null;
        }
        return inputArr;
    };

    //Кнопка запуска игры
    function modalButton(){
        let selectedSize = document.querySelector('input[name="sizeBoard"]:checked').value;
        document.querySelector('.modal-start').remove();

        container.innerHTML = '';
        container.append(
            createAppTitle('Игра в пары', 'h1')
        );

        startGame(selectedSize);
        gameTime();
    };

    function createModal(){
        const modalContainer = document.createElement('div');
        const modalDialog = document.createElement('div');
        const modalContent = document.createElement('div');
        const modalHeader = document.createElement('div');
        const modalBody= document.createElement('div');
        const modaFooter = document.createElement('div');
        const title = createAppTitle('Игра в пары', 'h2');
        const description = createAppTitle('Выберите количество карточек по вертикали/горизонтали', 'h5');
        const button = document.createElement('button');

        modalContainer.classList.add('modal-start');
        modalContainer.id = "exampleModal";

        modalDialog.className = 'modal-dialog modal-dialog-centered';
        modalContent.className = 'modal-content';

        button.classList.add('btn', 'btn-primary');
        button.textContent = 'Начать игру';
        button.addEventListener('click', modalButton)

        modalHeader.append(title);
        modalBody.append(description);
        modalBody.append(createRadioInput([2, 4, 6, 8, 10]))
        modaFooter.append(button);
        modalContent.append(modalHeader);
        modalContent.append(modalBody);
        modalContent.append(modaFooter);
        modalDialog.append(modalContent);
        modalContainer.append(modalDialog);

        document.body.append(modalContainer)
    };
    
    //создание кнопки перезапуска игры
    function restartGame(){
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-primary');
        button.textContent = 'Сыграть ещё раз';
        button.addEventListener('click', createModal);
        container.append(button);

        //Останавливает таймеры
        clearTimeout(playTime);
        clearInterval(remainingTime);
    };

    //Отключение всплытия события
    function handler(e) {
        e.stopPropagation();
        e.preventDefault();
    };

    //включение и выключение всплытия события
    function clickOff(check){
        !check
            ? document.removeEventListener('click', handler, true)
            : document.addEventListener('click', handler, true);
    }

    //проверка открытых карточек
    function checkingСards(){
        const cardsOpen = document.querySelectorAll('.card--active');
        if (cardsOpen.length === 2){
            clickOff(true);
            setTimeout(() => {
                cardsOpen.forEach(card => {
                    if(cardsOpen[0].textContent === cardsOpen[1].textContent){
                        card.classList.add('pair-defined');
                        card.removeEventListener('click', cardFlip);
                    } else{
                        card.classList.add('card--active-animOut');       
                        setTimeout(()=>{
                            card.classList.remove('card--active-animOut'); 
                        }, 400)       
                    }
                    card.classList.remove('card--active');
                }) 
                const cardsPair = document.querySelectorAll('.pair-defined');
                const cardsAll = document.querySelectorAll('.card');
                if(cardsPair.length === (cardsAll.length)){
                    restartGame(); 
                }
                clickOff(false); 
            }, 500);
        };
    };

    //контайнер, в котором будут распложены все игровые элементы
    const container = document.createElement('div');
    container.classList.add('container', 'd-flex', 'align-items-center', 'flex-column');

    //создание массива с перемешанными номерами, создание DOM-элементов карточек со своими номерами из массива произвольных чисел
    function startGame(count) {
        const gameBoard = shuffle(createNumbersArray(count));
        const board = document.createElement('ul');
        board.style.width = '100%'
        let line;
        const countCols = `row-cols-${count}`; 
        board.classList.add('board');

        gameBoard.forEach((item, index) => {
            if (index % count === 0){
                line = document.createElement('li');
                line.classList.add('board__line', 'row', countCols);
                board.append(line);
            }
            
            const card = document.createElement('div');
            card.classList.add('card', 'col');
            card.textContent = item;
            card.addEventListener('click', cardFlip);        
            line.append(card);
        });
        container.append(board);
        
        //Выравниват высоту по ширине карточек
        resizeHeightCard();
    }

    //Функция, генерирующая массив парных чисел
    function createNumbersArray(count) {
        count = count**2 / 2;
        const numbersArray = [];
        while(count > 0){
            numbersArray.unshift(count);
            numbersArray.unshift(count);
            count--;
        };
        return numbersArray;
    }
    
    //Псевдослучайное число (от min до max, не включая max)
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    //Функция перемешивания массива
    function shuffle(arr) {
        const newArr = [];
        const arrLength = arr.length;
        for(let i = 0; i < arrLength; i++){
            const count = getRandomInt(0, arr.length);
            getRandomInt(0, 2)
                ? newArr.push(arr[count])
                : newArr.unshift(arr[count]);
            arr.splice(count, 1);
        }
        return newArr;
    }
})();