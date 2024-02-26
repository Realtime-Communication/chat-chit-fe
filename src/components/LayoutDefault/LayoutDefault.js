import {Outlet} from 'react-router-dom';
import './LayoutDefault.scss'
function LayoutDefault() {
    return (
        <>
            <div className='layout_default'>
                <Outlet/>
            </div>
        </>
    )
}

export default LayoutDefault;