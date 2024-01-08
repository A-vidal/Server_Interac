// Aqui van los comandos que se ejecutan en el servidor cuando un cliente se conecta

var socketsList = new Array();

exports.connect = () => {
    socketsList.push(socket);
}

exports.disconnect = () => {
    socketsList.pop(socket);
}

exports.events = {
    "message": (socket, msj) => {
        socketsList.forEach(sock => {
            if (sock != socket) {
                sock.send(msj);
            }
        });
    } 
}