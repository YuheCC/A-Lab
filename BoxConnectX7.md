# DGX Spark互相连接

## 安装MLNX_OFED
选择系统页面：https://network.nvidia.com/products/infiniband-drivers/linux/mlnx_ofed/
直接下载地址：https://content.mellanox.com/ofed/MLNX_OFED-24.10-3.2.5.0/MLNX_OFED_LINUX-24.10-3.2.5.0-ubuntu24.04-aarch64.tgz

执行命令
```bash
wget https://content.mellanox.com/ofed/MLNX_OFED-24.10-3.2.5.0/MLNX_OFED_LINUX-24.10-3.2.5.0-ubuntu24.04-aarch64.tgz
tar -xzf MLNX_OFED_LINUX-24.10-3.2.5.0-ubuntu24.04-aarch64.tgz
cd MLNX_OFED_LINUX-24.10-3.2.5.0-ubuntu24.04-aarch64

// 只需要安装用户侧的命令，强制覆盖老版本
sudo ./mlnxofedinstall --user-space-only --force
```

记得重启
效果检查命令

```bash
ibdev2netdev
ibstat
```

## ip配置

```bash
sudo tee /etc/netplan/99-connectx7.yaml > /dev/null <<EOF
network:
  version: 2
  renderer: networkd
  ethernets:
    enp1s0f0np0:
      addresses:
        - 10.1.10.2/24
      mtu: 9000
      optional: true
EOF
```

配置完需要将脚本权限修改 + apply，开机后可以自动配置

```bash
sudo chmod 600 99-connectx7.yaml 
sudo netplan apply
```

mtu配置为9000，可以通过大包ping
测试命令

```bash
ping 10.1.10.1
ping -c 4 -s 4000 10.1.10.1
```