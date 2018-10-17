function toggleSignIn() {
  if (firebase.auth().currentUser) {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
  } else {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    if (email.length < 4) {
      alert('Please enter an email address.');
      return;
    }
    if (password.length < 4) {
      alert('Please enter a password.');
      return;
    }
    // Sign in with email and pass.
    // [START authwithemail]
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // [START_EXCLUDE]
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      } else {
      	// Sign up the user
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(errorSignUp) {
			    // Handle Errors here.
			    var errorCodeSignUp = errorSignUp.code;
			    var errorMessageSignUp = errorSignUp.message;
			    // [START_EXCLUDE]
			    if (errorCodeSignUp == 'auth/weak-password') {
			      alert('The password is too weak.');
			    } else {
			      alert(errorMessageSignUp);
			    }
			    console.log(errorSignUp);
			    // [END_EXCLUDE]
			  });
      }
      console.log(error);
      // [END_EXCLUDE]
    });
    // [END authwithemail]
  }
}

/**
 * Handles the sign up button press.
 */
function handleSignUp() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  if (email.length < 4) {
    alert('Please enter an email address.');
    return;
  }
  if (password.length < 4) {
    alert('Please enter a password.');
    return;
  }
  // Sign in with email and pass.
  // [START createwithemail]
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/weak-password') {
      alert('The password is too weak.');
    } else {
      alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
  });
  // [END createwithemail]
}

/**
 * Sends an email verification to the user.
 */
function sendEmailVerification() {
  // [START sendemailverification]
  firebase.auth().currentUser.sendEmailVerification().then(function() {
    // Email Verification sent!
    // [START_EXCLUDE]
    alert('Email Verification Sent!');
    // [END_EXCLUDE]
  });
  // [END sendemailverification]
}

function sendPasswordReset() {
  var email = document.getElementById('email').value;
  // [START sendpasswordemail]
  firebase.auth().sendPasswordResetEmail(email).then(function() {
    // Password Reset Email Sent!
    // [START_EXCLUDE]
    alert('Password Reset Email Sent!');
    // [END_EXCLUDE]
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode == 'auth/invalid-email') {
      alert(errorMessage);
    } else if (errorCode == 'auth/user-not-found') {
      alert(errorMessage);
    }
    console.log(error);
    // [END_EXCLUDE]
  });
  // [END sendpasswordemail];
}

function createDocument(user) {
	var uid = user.uid;

	firebase
  	.firestore()
  	.collection('users')
  	.doc(uid)
  	.set({data: 'data1'})
  .then(function() {
    console.log("Document successfully created!");
	});
}

function updateDocument(user, data) {
	var uid = user.uid;

	firebase
  	.firestore()
  	.collection('users')
  	.doc(uid)
  	.set({data: data})
  .then(function() {
    console.log("Document successfully updated!");
	});
}

function getDocument(user) {
	var uid = user.uid;
	var userData = 'data1';

	firebase
  	.firestore()
  	.collection('users')
  	.doc(uid)
  	.get()
  .then(function(doc) {
    if (doc.exists) {
      console.log("Document data:", doc.data());
      $("#data-wrapper textarea").val(doc.data().data);
    }
	}).catch(function(error) {
	    console.log("Error getting document:", error);
	});
}

/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {
  // Listening for auth state changes.

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;

      // if (!emailVerified) {
      // 	sendEmailVerification();
      // }

      var docRef = firebase.firestore().collection("users").doc(uid);

			docRef.get().then(function(doc) {
		    if (doc.exists) {
		      console.log("Document data:", doc.data());
      		$("#data-wrapper textarea").val(doc.data()['data']);
		    } else {
		    	$("#data-wrapper textarea").val('data1');
		    	createDocument(user);
		    }
			}).catch(function(error) {
			    console.log("Error getting document:", error);
			});
			      
      document.getElementById('sign-in').value = 'Logout';
      $("#btn-wrapper").append("<input type='button' id='backup' class='btn btn-default' value='Backup'>");
      $("#btn-wrapper").append("<input type='button' id='restore' class='btn btn-default' value='Restore'>");
      $("#title").text('Welcome ' + user.email + '!');
      $("#authentication-form").hide();
      $("#data-wrapper").show();
      
    } else {
      document.getElementById('sign-in').value = 'Login';
      $("#btn-wrapper").find('#backup').remove();
      $("#btn-wrapper").find('#restore').remove();
      $("#title").text('Please login first');
      $("#authentication-form").show();
      $("#data-wrapper").hide();
    }
  });

  document.getElementById('sign-in').addEventListener('click', toggleSignIn, false);
}

$(document).ready(function() {
	initApp();

	$(document).on('click', '#backup', function() {
		var user = firebase.auth().currentUser;
		updateDocument(user, $("#data-wrapper textarea").val());
	});

	$(document).on('click', '#restore', function() {
		var user = firebase.auth().currentUser;
		getDocument(user);
	});
})