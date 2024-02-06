import React, { useContext, useEffect, useRef, useState } from "react";
import './alert.scss'
export function Error(props){
    const [changeClass, setChangeClass] = useState('fade_in_out');
    setTimeout(() =>{
        setChangeClass('left_to_right');
    }, 3000)
    return (
        <>
            <div className={'alert_error ' + changeClass}>
                <div className="alert_one">
                    {props.value[0]}
                </div>
                <i className="alert_two">
                    {props.value[1]}
                </i>
            </div>
        </>
    )
}

export default Error;