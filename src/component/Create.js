import React, { useEffect } from 'react'
import {useState} from 'react'
import { useHistory } from "react-router-dom";


const Create = (props) =>{

    const [room,setRoom] = useState("");
    const history = useHistory();

    const handleRoomInput = (e) =>{
    setRoom(e.target.value)
    }

    const handleSubmit = (e) =>{
        history.push({
            pathname: '/room',
            search: '?roomId='+room,
            state: { roomId: room }

        })

    }

return <div>
    <div className="flex items-center flex-col justify-center mt-64 bg-gray-100 w-full">
    <input id="price" value={room} onChange={handleRoomInput} className="form-input rounded-md shadow-sm block w-64 mb-2 h-10 pl-5 pr-5 sm:text-sm sm:leading-5 pl-6 focus:outline-none focus:border-blue-300 border-gray-500 border-solid border-2" placeholder="Enter Room Name"/>
    <button onClick={handleSubmit} className="bg-black h-10 w-64 text-white shadow-sm rounded-md">Start</button>
    </div>
</div>
}

export default Create