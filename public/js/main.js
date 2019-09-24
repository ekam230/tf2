//Обработка формы Логин
window.onload = function () {
    let btn = document.getElementById('btn');
    let inputs = document.getElementsByTagName('input');

    btn.addEventListener('click', function () {
        let xhr = new XMLHttpRequest();

        xhr.open('POST', '/login');
        let userData = {
            username: inputs[0].value,
            password: inputs[1].value
        }

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(userData));

        xhr.onload = function () {
            // alert(this.responseText);
            // Redirect on /:
            window.location.replace("/");
        };

        xhr.onerror = function () {
            alert('Server error!');
        }
    })
}