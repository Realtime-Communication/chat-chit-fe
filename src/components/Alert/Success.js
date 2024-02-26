import React, { useContext, useEffect, useRef, useState } from "react";
import './alert.scss'
function Success(props){
    return (
        <>
            <div className={"alert_success " + 'left_to_right'}>
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

export default Success;