/*
    # Договоренность с самим собой по переменным
    var int fieldnum    - номер поля
    var int pieceid     - идентификтаор фишек
    # Функции
    obj { int x , int y } calcLastFieldPos(int fieldnum) - вычисляет координаты свободного поля
*/

$(document).ready(function(){
    window.board    = new Board();
    window.rules    = new Rules();
    window.bones    = new Bones('.dice');
    window.socket   = new Socket();
    window.game     = new Game(window.board , window.rules , window.bones , window.socket); // УПРАВЛЯЮЩИЙ ОБЪЕКТ СИСТЕМЫ

    window.game.bones.changeSide(0 , 'left');
    window.game.bones.changeSide(1 , 'right');
    
    /*      ### Работа с сервером ###       */
    
    window.game.loadImages(function(){
            // регистрируемся на сервере
            window.game.registrOnServer({id : randomNumber(1 , 1000)});
            
            // инициализируем игровую доску
            window.board.init();
            
            // получаем стартовые данные игры
            window.game.setListener('takeGameData' , 'Game' , 'takeGameData');
            
            // получаем шакги от соперника
            window.game.setListener('takeStep' , 'Game' , 'takeStep');
            
            // получаем указание начать ход
            window.game.setListener('stepBegin' , 'Game' , 'stepBegin');
            
            // получаем указания болтать кости
            window.game.setListener('takeBones' , 'Game' , 'takeBones');
            
            // концовочка хода
            window.game.setListener('finishGame' , 'Game' , 'endGame');
            window.game.setListener('takeReInvite' , 'Game' , 'getReInvite');
        });
        
        
    
    function randomNumber(min, max){
    	var rand = min - 0.5 + Math.random()*(max-min+1);
    	rand = Math.round(rand);
    	return rand;
    }
    
    ion.sound({
        sounds: [
            {name: "dice"} ,
            {name: "piece"}
        ],
        path: "sounds/",
        preload: true,
        volume: 1.0
     });
});


/*

# функция создает наследование объектов без выполнения конструктора предка

function inherit(object , parent){
    function F(){}
    F.prototype = parent.prototype;
    object.prototype = new F();
    return object;
}

*/