variable "linode_api_token" {
    description = "Linode API token for the given linode account"
    type = string
    
    }
variable "root_pass" {}
variable "region" {
    description = "This is the location where the Linode instance is deployed."
    default     = "us-east"
}
terraform {
  required_providers {
    linode = {
      source = "linode/linode"
      version = "2.31.0"
    }
  }
}

provider "linode" {
    token = var.linode_api_token 
}

resource "linode_instance" "example_instance" {
    label = "example_instance_label"
    image = "linode/ubuntu18.04"
    region = var.region
    type = "g6-standard-1"
    authorized_keys = [replace(file("~/.ssh/tf_linode_ssh_key.pub"),"\n", "")]
    root_pass = var.root_pass
}
