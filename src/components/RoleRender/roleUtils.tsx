import { useTranslation } from 'react-i18next';

const roleList = ['common', 'research', 'explorer', 'team', 'enterprise', 'joint', 'admin'];
const roleColor = ['#e5e6e8', '#c6f0c1', '#cedcfe', '#cedcfe', '#ffe928', '#ffe928', '#baac34'];
const roleConfig = {
    common: {
        name: 'common',
        description: 'Common',
        permissions: ['common']
    },
}
const useRoleConfig = () => {
    const { t } = useTranslation();
    return Object.fromEntries(roleList.map((role, index) => {
        return [role, {
            name: t(`role.${role}`),
            color: roleColor[index]
        }]
    }));
}

export default roleList;
export { roleConfig, useRoleConfig };