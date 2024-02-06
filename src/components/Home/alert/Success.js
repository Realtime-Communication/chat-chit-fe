import React, { useContext, useEffect, useRef, useState } from "react";
import './alert.scss'
function Success(props){
    console.log(props, " alert")
    return (
        <>
            <div className="alert_success">
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