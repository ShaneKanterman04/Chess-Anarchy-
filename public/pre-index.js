function play_user(){
       const url = new URLSearchParams(window.location.search);
       const user_ID = url.get('user');
       window.location.href = 'matchSearch.html?role=player&user=' + user_ID;
};

function spec_user(){
       window.location.href = "matchSearch.html?role=spectator" + user_ID;
};

 function admin_user(){
       window.location.href = "admin.html";
};
