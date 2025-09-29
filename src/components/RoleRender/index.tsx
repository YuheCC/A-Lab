import { useRoleConfig } from './roleUtils';

const RoleRender = ({role}: {role?: string | null}) => {
    const roleConfig = useRoleConfig();
    if(!role){
        return null;
    }

    const config = roleConfig[role];
    if(!config){
        return <span className="subscription-badge">{role}</span>;
    }

    return (
        <span className="subscription-badge" style={{backgroundColor: config.color}}>{config.name}</span>
    )
}

export default RoleRender;
