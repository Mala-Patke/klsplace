//There's got to be a more efficient way to do this
document.addEventListener('DOMContentLoaded', () => {
    let currentUser = firebase.auth().currentUser;

    if(!currentUser) {
        let loginButton = document.createElement('button');
        $(loginButton)
            .text("Login")
            .attr("id", "login")
            .on('click', () => {
                let provider = new firebase.auth.GoogleAuthProvider();
    
                firebase.auth().signInWithRedirect(provider);
            
                firebase.auth().getRedirectResult()
                    .then(res => {
                        firebase.auth().currentUser.updateProfile({
                            displayName: res.user.displayName
                        });
                    });           
            })
            .appendTo('#loggedin');
    } else {
        let uDisplay = document.createElement('div');
        $(uDisplay)
            .attr('id', 'username')
            .text(currentUser.displayName)
            .appendTo('#loggedin');
    }

    firebase.auth().onAuthStateChanged(user => {
        if(!user) return;

        let uDisplay = document.createElement('div');
        $('#loggedin')
            .empty()
            .append(
                $(uDisplay).text(user.displayName)    
            );
    });
});
