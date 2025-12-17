import {Link} from "react-router-dom";

export default function Sidebar() {
    return (
        <nav style={{width:"200px", padding:"20px", borderRight:"1px solid #ccc"}}>
        <h2>Menu</h2>
        <ul>
            <li><Link to ="/">Infrastructure</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
        </ul>
        </nav>
    )
}