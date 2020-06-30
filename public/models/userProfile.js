// DEFINE USER CONNECTION
var UserConnection = require('../models/userConnection');

class UserProfile {
  constructor(uid, userConnections) {
    this.uid = uid;
    this.userConnections = userConnections;
  }

// Set UserID
setUserID(uid) {
  this.uid = uid;
}

// Get UserID
getUserID() {
  return this.uid;
}

// SET CONNECTION
setConnections(userConnections){
    this.userConnections = userConnections;
}

// ADD CONNECTION
  addConnection(connection, rsvp){
    for (var i=0; i < this.userConnections.length; i++) {
      if (this.userConnections[i].connection.connectionID == connection.connectionID){
        this.userConnection[i].setRSVP(rsvp);
        return 0;
      }
    }
      var newCon = new UserConnection(connection, rsvp);
      this.userConnections.push(newCon);
      return 1;
    }

// REMOVE CONNECTION
  removeConnection(connectionID) {
      var found = false;
      var number = -1;

      for(var i = 0; i < this.userConnections.length; i++){

          if(this.userConnections[i].connection.getConnectionID() == connectionID){
            found = true;
            number = i;
            break;
          }
        }

            if(found == true){
              console.log("Connection to delete exists");
              this.userConnections.splice(number, 1);
            } else {
              console.log("Connection is not found in list");
            }
        }

// UPDATE CONNECTION
  updateConnection(id, newRSVP){
    for(var i = 0; i < this.userConnections.length; i++){
          // if passed in
          if(this.userConnections[i].connection.connectionID == id){
              this.userConnections[i].setRSVP(newRSVP);
              break;
          } else {
            console.log("RSVP to update is not found in list");
          }
      }
  }

// GET CONNECTION
  getConnections(){
    return this.userConnections;
  }

// EMPTY PROFILE
  emptyProfile(){
      this.userConnections.legth = 0;
  }

};

module.exports = UserProfile;
