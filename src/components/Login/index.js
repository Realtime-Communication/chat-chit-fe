function Login() {
    const list = [
        "Home",
        "Products",
        "News",
        "Introduction",
        "Reference"
    ];
    return (
        <>
            <ul className="ul-style">
                {list.map((item, index) => <li key={index}> <a href="#">{item}</a> </li>)}
            </ul>
        </>
    )
}

export default Login;