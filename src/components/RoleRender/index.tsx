import { useRoleConfig } from './roleUtils';

const RoleRender = ({role}: {role?: string | null}) => {
    const roleConfig = useRoleConfig();
    if(!role || role === undefined){
        return null;
    }

    return (
        <span className="subscription-badge" style={{backgroundColor: roleConfig[role].color}}>{roleConfig[role].name}</span>
    )
}

export default RoleRender;