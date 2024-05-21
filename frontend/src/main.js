import { BACKEND_PORT } from './config.js';
import { fileToDataUrl } from './helpers.js';

let token = null;

const pages = ['login', 'register', 'inndashboard'];
const goToPage = (newPage) => {
	if (['login', 'register'].includes(newPage)) {
		document.getElementById('nav-logged-out').style.display = 'block';
		document.getElementById('nav-logged-in').style.display = 'none';
	}
    else {
		document.getElementById('nav-logged-out').style.display = 'none';
		document.getElementById('nav-logged-in').style.display = 'block';
	}
	for (const page of pages) {
		document.getElementById(`page-${page}`).style.display = 'none';
	}
    
	document.getElementById(`page-${newPage}`).style.display = 'block';
	document.getElementById('page-inndashboard').style.display = 'none';
	//document.getElementById('thread-list').style.display = 'block';

}

document.getElementById('nav-login').addEventListener('click', () => {
	goToPage('login');
});

document.getElementById('nav-register').addEventListener('click', () => {
	goToPage('register');
});

document.getElementById('logout').addEventListener('click', () => {
    startCount = 0; 
	token = null;
	localStorage.removeItem('token');
	goToPage('login');
    document.getElementById('thread-list').style.display = 'none'; 
    document.getElementById('individual-thread').style.display = 'none';
    document.getElementById('edit-thread').style.display = 'none';


});
document.getElementById('create').addEventListener('click', () => {
	document.getElementById('page-inndashboard').style.display = 'block';
});

document.getElementById('edit').addEventListener('click', () => {
    console.log(currentThreadId);
    if(currentThreadId !== null){
        document.getElementById('individual-thread').style.display = 'none'; 
        document.getElementById('edit-thread').style.display = 'block';
        document.getElementById('edit-title').value = document.getElementById('thread-title').innerText;
        document.getElementById('edit-content').value = document.getElementById('thread-content').innerText;

    }
    else{
        alert('No threads selected!');
    }
});

let commentLiked = false;

document.getElementById('comment-like-btn').addEventListener('click', () => {
    commentLiked = !commentLiked;
	fetch('http://localhost:5005/comment/like' , {
	  method: 'PUT',
	  headers: {
        'accept': 'application/json',
        'Content-type': 'application/json',
        'Authorization': token,
      },
	  body: JSON.stringify({
        "id": currentThreadId,
        "turnon": !commentLiked,
	  })
	}).then((response) => {
		response.json().then((data) => {
			if (data.error) {
				alert(data.error);
			} else {
                commentLiked = data.turnon;
                if (commentLiked) {
                    document.getElementById('comment-like-btn').textContent = 'Unlike';
                } else {
                    document.getElementById('comment-like-btn').textContent = 'Like';
                }
			}
		});
	});
});

document.getElementById('comment-delete-btn').addEventListener('click', () => {
	fetch('http://localhost:5005/comment', {
	  method: 'DELETE',
	  headers: {
        'accept': 'application/json',
        'Content-type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        "id": currentThreadId,
    })
	}).then((response) => {
		if (response.ok) {
            getCommentDetails();
        }
        else{
            response.json().then((data) => {
                alert(data.error);
            });
        }
	}).catch((error) => {
        console.error('Error deleting comment:', error);
        alert('An error occurred while deleting the comment.');
    });
});

document.getElementById('comment-btn').addEventListener('click', () => {
    const commentText = document.getElementById('comment-text').value;
    fetch('http://localhost:5005/comment', {
	  method: 'POST',
	  headers: {
        'accept': 'application/json',
        'Content-type': 'application/json',
        'Authorization': token,
      },
	  body: JSON.stringify({
        "content": commentText,
        "threadId": currentThreadId,
        "parentCommentId": 52849,
	  })
	}).then((response) => {
		response.json().then((data) => {
			if (data.error) {
				alert(data.error);
			} else {
                getCommentDetails();
			}
		});
	});
});

document.getElementById('individual-thread').addEventListener('show', () => {
    getCommentDetails();
});

const getCommentDetails = () =>  {
    if(currentThreadId){
        fetch(`http://localhost:5005/comments?threadId=${currentThreadId}`, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Content-type': 'application/json',
            'Authorization': token,
        }
        }).then((response) => {
            response.json().then((data) => {
                if (data.error) {
                    alert(data.error);
                } else {
                    const commentsList = document.getElementById('comments-section');
                    commentsList.innerHTML = '';
                    data.sort((a, b) => new Date(b.date) - new Date(a.date));
                    data.forEach(data => {
                        displayComment(data, commentsList);
                    });
                }
            });
        });
    }
}

/*created the comment display function, comments aren't visible, neither are the parameters to display*/
const displayComment = (comment, parentComment) =>{
    const commentItem = document.createElement('li');
    commentItem.textContent = comment.text;
    const commentDom = document.createElement('div');
    const commentPicture = document.createElement('img');
    commentPicture.src = comment.profilePicture;
    commentDom.appendChild(commentPicture);
    const commentDetails = document.createElement('span');
    commentDetails.style.fontSize = 'smaller';
    commentDetails.textContent = ` ${comment.time} Likes: ${comment.likes}`;
    commentDom.appendChild(commentDetails);
    commentItem.appendChild(commentDom);
    if (comment.replies && comment.replies.length > 0) {
        const repliesList = document.createElement('ul');
        comment.replies.forEach(reply => {
            displayComment(reply, repliesList);
        });
        commentItem.appendChild(repliesList);
    }
    parentComment.appendChild(commentItem);
}

let threadWatched = false;

document.getElementById('thread-watch-btn').addEventListener('click', () => {
    threadWatched = !threadWatched;
	fetch('http://localhost:5005/thread/watch' , {
	  method: 'PUT',
	  headers: {
        'accept': 'application/json',
        'Content-type': 'application/json',
        'Authorization': token,
      },
	  body: JSON.stringify({
        "id": currentThreadId,
        "turnon": !threadWatched,
	  })
	}).then((response) => {
		response.json().then((data) => {
			if (data.error) {
				alert(data.error);
			} else {
                threadWatched = data.turnon;
                if (threadWatched) {
                    document.getElementById('thread-watch-btn').textContent = 'Unwatch';
                } else {
                    document.getElementById('thread-watch-btn').textContent = 'Watch';
                }
			}
		});
	});
});

let threadLiked = false;

document.getElementById('thread-like-btn').addEventListener('click', () => {
    threadLiked = !threadLiked;
	fetch('http://localhost:5005/thread/like' , {
	  method: 'PUT',
	  headers: {
        'accept': 'application/json',
        'Content-type': 'application/json',
        'Authorization': token,
      },
	  body: JSON.stringify({
        "id": currentThreadId,
        "turnon": !threadLiked,
	  })
	}).then((response) => {
		response.json().then((data) => {
			if (data.error) {
				alert(data.error);
			} else {
                threadLiked = data.turnon;
                if (threadLiked) {
                    document.getElementById('thread-like-btn').textContent = 'Unlike';
                } else {
                    document.getElementById('thread-like-btn').textContent = 'Like';
                }
			}
		});
	});
});

document.getElementById('thread-delete').addEventListener('click', () => {
	fetch('http://localhost:5005/thread', {
	  method: 'DELETE',
	  headers: {
        'accept': 'application/json',
        'Content-type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        "id": currentThreadId,
    })
	}).then((response) => {
		if (response.ok) {
            startCount = 0;
            loadThreads();
            getThreadDetails(freshThreadId);
        }
        else{
            response.json().then((data) => {
                alert(data.error);
            });
        }
	}).catch((error) => {
        console.error('Error deleting thread:', error);
        alert('An error occurred while deleting the thread.');
    });
});


document.getElementById('submit').addEventListener('click', () => {
    console.log(currentThreadId);
	const title = document.getElementById('edit-title').value;
    const content = document.getElementById('edit-content').value;
    const isPrivate = document.getElementById('edit-private').value === 'on';
    const isLocked = document.getElementById('edit-locked').value === 'on';
	console.log({
	  	title: title,
	  	content: content,
	  	isPrivate: isPrivate,
        isLocked: isLocked,
	  })
	fetch('http://localhost:5005/thread' , {
	  method: 'PUT',
	  headers: {
        'accept': 'application/json',
        'Content-type': 'application/json',
        'Authorization': token,
      },
	  body: JSON.stringify({
        "id": currentThreadId,
        "title": title,
        "isPublic": isPrivate,
        "lock": isLocked,
        "content": content,
	  })
	}).then((response) => {
		response.json().then((data) => {
			if (data.error) {
				alert(data.error);
			} else {
                document.getElementById('thread-title').innerText = title;
                document.getElementById('thread-content').innerText = content;
                document.getElementById('individual-thread').style.display = 'block';
                document.getElementById('edit-thread').style.display = 'none';
			}
		});
	});
});


document.getElementById('new-thread-submit').addEventListener('click', () => {
	const title = document.getElementById('new-thread-title').value;
	const isPublic = document.getElementById('new-thread-public').value === 'on';
	const content = document.getElementById('new-thread-content').value;
	console.log({
	  	title: title,
	  	isPublic: isPublic,
	  	content: content,
	  })
	fetch('http://localhost:5005' + '/thread', {
	  method: 'POST',
	  headers: {
        'Content-type': 'application/json',
        'Authorization': token,
      },
	  body: JSON.stringify({
	  	title: title,
	  	isPublic: isPublic,
	  	content: content,
	  })
	}).then((response) => {
		response.json().then((data) => {
			if (data.error) {
				alert(data.error);
			} else {
                startCount = 0;
				loadThreads();
	            document.getElementById('page-inndashboard').style.display = 'none';
			}
		});
	});
});

document.getElementById('register-go').addEventListener('click', () => {
	const email = document.getElementById('register-email').value;
	const password = document.getElementById('register-password').value;
	const conpassword = document.getElementById('register-conpassword').value;
	const name = document.getElementById('register-name').value;


	fetch('http://localhost:5005' + '/auth/register', {
	  method: 'POST',
	  headers: {
        'Content-type': 'application/json',
      },
	  body: JSON.stringify({
	  	email: email,
	  	password: password,
	  	conpassword: conpassword,
	  	name: name,
	  })
	}).then((response) => {
		response.json().then((data) => {
			if (data.error) {
				alert(data.error);
            }
            else if(password !== conpassword){
                alert('Password does not match');
            }
			 else {
				token = data.token;
				localStorage.setItem('token', token);
                startCount = 0;
				goToPage('inndashboard');
                document.getElementById('thread-list').style.display = 'block';
                loadThreads();
                document.getElementById('get-threads').style.display = 'block';
			}
		});
	});
});


const domClickListen = (element, fn) => {
	document.getElementById(element).addEventListener('click', fn);
}

document.getElementById('login-go').addEventListener('click', () => {
	const email = document.getElementById('login-email').value;
	const password = document.getElementById('login-password').value;

	fetch('http://localhost:5005' + '/auth/login', {
	  method: 'POST',
	  headers: {
        'Content-type': 'application/json',
      },
	  body: JSON.stringify({
	  	email: email,
	  	password: password,
	  })
	}).then((response) => {
		response.json().then((data) => {
			if (data.error) {
				alert(data.error);
			} else {
				token = data.token;
				localStorage.setItem('token', token);
                startCount = 0;
				goToPage('inndashboard');
                document.getElementById('thread-list').style.display = 'block';
                loadThreads();
                document.getElementById('get-threads').style.display = 'block';
			}
		});
	});
});

let startCount = 0; 
let freshThreadId = null;

const loadThreads = () => {
	fetch(`http://localhost:5005/threads?start=${startCount}`, {
	  method: 'GET',
	  headers: {
        'Content-type': 'application/json',
        'Authorization': token,
      }
	}).then((response) => {
		response.json().then((data) => {
			if (data.error) {
				alert(data.error);
			} else {
                localStorage.setItem('threads', JSON.stringify(data));
				document.getElementById('threads').innerText = '';
				for (const threadId of data) {
                    freshThreadId = threadId;
					const threadDom = document.createElement('div');
                    threadDom.style.width = '200px'; 
                    threadDom.style.height = '70px'; 
                    threadDom.style.border = '1px solid grey';
					//threadDom.innerText = threadId;
                    fetch(`http://localhost:5005/thread?id=${threadId}`, {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                        'Authorization': token,
                    }
                    }).then((response) => {
                        response.json().then((data) => {
                            if (data.error) {
                                alert(data.error);
                            } else {
                                const title = document.createElement('h5');
                                title.textContent = data.title;
                                threadDom.appendChild(title);
                                const threadDetails = document.createElement('span');
                                threadDetails.style.fontSize = 'smaller';
                                threadDetails.textContent = ` ${data.author} ${data.postDate} Likes: ${data.likes}`; 
                                threadDom.appendChild(threadDetails);
                            }
                        });
                    });
                    threadDom.addEventListener('click', () => {
                        getThreadDetails(threadId);
                    });
					document.getElementById('threads').appendChild(threadDom);
				}
                if(data.length < 5){
                    document.getElementById('get-threads').style.display = 'none';
                }
                else{
                    startCount += 5;
                }
			}
		});
	});
};

document.getElementById('get-threads').addEventListener('click', loadThreads);

let currentThreadId = null;

const getThreadDetails = (threadId) => {
    currentThreadId = threadId;
    fetch(`http://localhost:5005/thread?id=${threadId}`, {
	  method: 'GET',
	  headers: {
        'Content-type': 'application/json',
        'Authorization': token,
      }
	}).then((response) => {
		response.json().then((data) => {
			if (data.error) {
				alert(data.error);
			} else {
                document.getElementById('individual-thread').style.display = 'block';
                document.getElementById('thread-title').innerText = data.title;
                document.getElementById('thread-content').innerText = data.content;
                document.getElementById('thread-likes').innerText = data.likes;
                document.getElementById('thread-like-btn').textContent = threadLiked ? 'Unlike' : 'Like';
			}
		});
	});
}

const getUserDetails = (threadId) => {
    fetch(`http://localhost:5005/user?userId=${threadId}`, {
	  method: 'GET',
	  headers: {
        'accept': 'application/json',
        'Content-type': 'application/json',
        'Authorization': token,
      }
	}).then((response) => {
		response.json().then((data) => {
			if (data.error) {
				alert(data.error);
			} else {
                document.getElementById('individual-thread').style.display = 'block';
                document.getElementById('thread-title').innerText = data.title;
                document.getElementById('thread-content').innerText = data.content;
                document.getElementById('thread-likes').innerText = data.likes;
			}
		});
	});
}

if (localStorage.getItem('token')) {
	token = localStorage.getItem('token');
	goToPage('inndashboard');
	loadThreads();
} else {
	goToPage('login');
}

