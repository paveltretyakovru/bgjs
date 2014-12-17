window.auth = false

window.App =
    views       : {} ,
    models      : {} ,
    collections : {}

App.models.user = Backbone.Model.extend
    defaults :
        id          : _userId
        sessionId   : _sessionId
        login       : ''
        urlRoot     : '/user'

# Вид авторизации пользователя
App.views.auth = Backbone.View.extend
    el      : $('#welcome-form') ,
    events  :
        'submit' : 'auth'
    auth : (event) ->
        event.preventDefault()
        login = $('input[name="login"]').val()
        window.socket.connection.emit 'test' , login : login

modelUser       = new App.models.user
viewAuth        = new App.views.auth model : modelUser

App.views.users = Backbone.View.extend
    model : modelUser

App.collections.users = Backbone.Collection.extend model : App.models.user
collectionUsers = new App.collections.users 


