type Props = {
    instance : any;
}

export function InstanceCard({instance}:Props) {
    return (
        <div style={{border: "1px solid #ccc", padding: "12px", marginBottom: "12px"}}>
            <h3>{instance.name}</h3>
            <p>Status: {instance.state}</p>
            <p>Type: {instance.instance_type}</p>
        </div>
    )
}