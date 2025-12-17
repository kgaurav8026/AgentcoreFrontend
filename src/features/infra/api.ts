export async function fetchInstances(projectId: string){
    const res = await fetch(`https://${projectId}.mockapi.io/api/project-instances/instances`);
    if(!res.ok) {
        throw new Error("Failed to fetch instance");
    }
    return res.json();
}