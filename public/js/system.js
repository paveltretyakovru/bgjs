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
    
    // регистрируемся на сервере
    window.game.registrOnServer({id : randomNumber(1 , 1000)});
    
    // инициализируем игровую доску
    window.board.init();
    
    // получаем стартовые данные игры
    window.game.setListener('takeGameData' , 'Game' , 'takeGameData');
    
    function randomNumber(min, max){
    	var rand = min - 0.5 + Math.random()*(max-min+1);
    	rand = Math.round(rand);
    	return rand;
    }
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