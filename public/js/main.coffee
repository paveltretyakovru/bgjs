$(document).ready ->
    window.board    = new Board()
    window.rules    = new Rules()
    window.bones    = new Bones('.dice')
    window.socket   = new Socket()
    window.game     = new Game(window.board , window.rules , window.bones , window.socket)
    
    window.game.bones.changeSide(0 , 'left')
    window.game.bones.changeSide(1 , 'right')
    
    window.game.loadImages ->
        # регистрируемся на сервере
        window.game.registrOnServer({id : randomNumber(1 , 1000)})
            
        # инициализируем игровую доску
        window.board.init()
            
        # получаем стартовые данные игры
        window.game.setListener('takeGameData' , 'Game' , 'takeGameData')
        
        # получаем шакги от соперника
        window.game.setListener('takeStep' , 'Game' , 'takeStep')
        
        # получаем указание начать ход
        window.game.setListener('stepBegin' , 'Game' , 'stepBegin')
        
        # получаем указания болтать кости
        window.game.setListener('takeBones' , 'Game' , 'takeBones')
        
        # концовочка хода
        window.game.setListener('finishGame' , 'Game' , 'endGame')
        window.game.setListener('takeReInvite' , 'Game' , 'getReInvite')
    
    randomNumber = (min , max) ->
        rand = min - 0.5 + Math.random() * (max - min + 1)
        Math.round rand
    
    # создаем параметры для звуков
    dice_sound_params  = name : 'dice'
    piece_sound_params = name : 'piece'
    
    ion.sound
        sounds  : [dice_sound_params , piece_sound_params]
        path    : 'sounds/'
        preload : true
        volume  : 1.0
    
    