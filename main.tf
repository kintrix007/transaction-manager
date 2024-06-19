terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.108.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "default" {
  name     = "trmgr-group"
  location = "West Europe"

  tags = {
    source = "Terraform"
    environment = "dev"
  }
}

resource "azurerm_virtual_network" "default" {
  name                = "trmgr-vnet"
  address_space       = ["10.0.0.0/16"]
  resource_group_name = azurerm_resource_group.default.name
  location            = azurerm_resource_group.default.location

  tags = {
    source = "Terraform"
    environment = "dev"
  }
}

resource "azurerm_subnet" "default" {
  name                 = "trmgr-subnet"
  resource_group_name  = azurerm_resource_group.default.name
  virtual_network_name = azurerm_virtual_network.default.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_network_interface" "default" {
  name                = "trmgr-net-interface"
  resource_group_name = azurerm_resource_group.default.name
  location            = azurerm_resource_group.default.location

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.default.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.default.id
  }

  tags = {
    environment = "dev"
  }
}

resource "azurerm_network_security_group" "default" {
  name                = "trmgr-network-secutity-group"
  resource_group_name = azurerm_resource_group.default.name
  location            = azurerm_resource_group.default.location

  tags = {
    environment = "dev"
  }
}

resource "azurerm_network_security_rule" "dev-rule" {
  name                        = "trmgr-dev-rule"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "*" # Could be "Tcp" etc...
  source_port_range           = "*"
  destination_port_range      = "*"
  source_address_prefix       = "83.85.194.24/32"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.default.name
  network_security_group_name = azurerm_network_security_group.default.name
}

resource "azurerm_subnet_network_security_group_association" "default" {
  subnet_id                 = azurerm_subnet.default.id
  network_security_group_id = azurerm_network_security_group.default.id
}

resource "azurerm_public_ip" "default" {
  name                = "trmgr-ip"
  allocation_method   = "Dynamic"
  resource_group_name = azurerm_resource_group.default.name
  location            = azurerm_resource_group.default.location

  tags = {
    environment = "dev"
  }
}

# resource "azurerm_nginx_deployment" "default" {
#   name                = "trmgr-nginx"
#   sku                 = "standard_Monthly"
#   resource_group_name = azurerm_resource_group.default.name
#   location            = azurerm_resource_group.default.location
#   email               = "kintrix007@proton.me"
#
#   frontend_public {
#     ip_address = [azurerm_public_ip.default.id]
#   }
#   network_interface {
#     subnet_id = azurerm_subnet.default.id
#   }
# }
#
# resource "azurerm_nginx_configuration" "default" {
#   nginx_deployment_id = azurerm_nginx_deployment.default.id
#   root_file = "/etc/nginx/nginx.conf"
#   
#   config_file {
#     content = base64decode(<<-EOT
# EOT
#     )
#     virtual_path = "/etc/nginx/nginx.conf"
#   }
# }

resource "azurerm_linux_virtual_machine" "default" {
  name                = "trmgr-tf"
  resource_group_name = azurerm_resource_group.default.name
  location            = azurerm_resource_group.default.location
  size                = "Standard_B1s"
  admin_username      = "kin"

  network_interface_ids = [
    azurerm_network_interface.default.id,
  ]

  admin_ssh_key {
    username   = "kin"
    public_key = file("~/.ssh/id_rsa.pub")
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  tags = {
    environment = "dev"
  }
}
