import React, { useState } from "react";
import Server, { Switch, Add } from "./Server";
import "./SidePannel.scss";
import AddModal from "../AddModal/AddModal";
import uuidv4 from "uuid/v4";

const SidePannel = ({ firebase, user, loadJoinedServers, joinedServers }) => {
  const [showModal, setShowModal] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const serverRef = firebase.database().ref("servers");
  const storage = firebase.storage().ref("serversIcon");

  const handleCreateServer = (name, file) => {
    //first we gonna upload the icon
    uploadFile(file, name);
    //after icon uploaded its gonna call createServer with url
  };
  const uploadFile = (file, name) => {
    const path = uuidv4(); //generate unique filename
    const task = storage.child(path + ".jpg").put(file); //upload it to storage

    //add event event listner(task.on(1,2,3,4)) to check the upload status and get download url after upload done
    // task.on accepts 4 args =>  1."event name", 2."snap on every change", 3."error", 4."done"
    task.on(
      "state_changed", //1. event name
      snap => {
        //2. snap on every change
        var percentage =
          Math.round(snap.bytesTransferred / snap.totalBytes) * 100;
        setPercentage(percentage);
      },
      err => console.log(err.message), //3. errors
      () => {
        //4. when upload is done
        //get url of icon
        task.snapshot.ref.getDownloadURL().then(url => {
          createServer(name, url); //create server after icon uploaded
        });
      }
    );
  };

  const createServer = (name, url) => {
    //create server in database with url and name
    const key = serverRef.push().getKey();
    serverRef
      .child(key)
      .set({
        name,
        url,
        id: key,
        admin: { name: user.displayName, uid: user.uid }
      })
      .then(() => {
        addServer(name, url, key);
      })
      .catch(err => console.log(err));
  };

  //added created server to user data
  const addServer = (name, url, id) => {
    firebase
      .database()
      .ref("users")
      .child(`${user.uid}/servers/${id}`)
      .set({
        name,
        url,
        id
      })
      .then(() => {
        setShowModal(false);
        loadJoinedServers(user.uid);
      });
  };

  return (
    <div className="sidepannel">
      <Switch url="https://i.imgur.com/qMgJs45.png" />
      <div className="underline"></div>

      {/* display joined servers */}
      {joinedServers
        ? joinedServers.map(server => (
            <Server
              url={server.url}
              key={server.id}
              onClick={() => console.log(server.id)}
            />
          ))
        : ""}

      <Add
        onClick={() => setShowModal(true)}
        url="https://cdn3.iconfinder.com/data/icons/stroke/53/Button-512.png"
      />
      {showModal ? (
        <AddModal
          server
          show={showModal}
          createServer={handleCreateServer}
          handleClose={() => setShowModal(false)}
        />
      ) : null}
    </div>
  );
};

export default SidePannel;