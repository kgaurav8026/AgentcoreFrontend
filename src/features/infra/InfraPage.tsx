import {InstanceList} from "./InstanceList";

export default function InfraPage() {
    const projectId = "694197ff686bc3ca816784c5";
    if(!projectId) {
        return <p>No Project Selected</p>
    }

    return (
        <div>
            <h1>Infrastructure Page</h1>
            <InstanceList projectId = {projectId}/>
        </div>
    )
}