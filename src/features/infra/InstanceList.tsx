import {useQuery} from "@tanstack/react-query";
import { fetchInstances } from "./api";
import {InstanceCard} from "./InstanceCard";

export function InstanceList({projectId}:{projectId:string}) {
    const {data, isLoading, error} = useQuery({
        queryKey:["instances", projectId],
        queryFn: ()=> fetchInstances(projectId),
        refetchInterval:5000
    });
    if(isLoading) return <p>Loading instances...</p>
    if(error) return <p>Failed to load instances</p>
    if(!data) return <p>No instances found</p>

    return (
        <div>
            {
              data.map((inst : any)=>(
                    <InstanceCard key={inst.id} instance={inst}/>
                ))
            }
        </div>
    )

}

