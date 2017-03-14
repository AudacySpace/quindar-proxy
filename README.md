# Welcome to Quindar Proxy

The quindar-proxy project is the backend server node application that manages data transport and system configuration(acts as a proxy) for mission operations application(Quindar). It has the ability to define configuration for each source of real time telemetry, and reading the telemetry data using WebSockets(socketIO) between data source and Quindar proxy.

## Installation
For installing Quindar Proxy Server, follow the instructions mentioned in [quindar-deploy](https://github.com/quindar/quindar-deploy/blob/master/README.md) under **qsvr Install**.

## How to Navigate
The proxy server contains three tabs on the left sidebar.
1. Mongo Database - This is GUI for the Mongo database residing on this server.
2. Data Sources - This gives the ability to add multiple configurations(excel file) for realtime telemetry sources by addding the source IP address and the excel file for configuration. The configuration file should contain defined configuration for each telemetry data point. [Download](app/uploads/GMAT.xlsx) the sample configuration file. 
3. Netdata - It is a system for distributed real-time performance and health monitoring. This tab shows real-time parameters of Quindar Proxy server using modern interactive web dashboards.

## Contributing
We encourage you to contribute to Quindar Proxy! Please check out the file [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines about how to proceed.

## Code of Conduct
Everyone contributing to the repositories under Quindar organization, issue trackers and mailing lists is expected to follow the Quindar [Code of Conduct](CODE_OF_CONDUCT.md). 

## About Us
Audacy was launched in 2015 by Stanford graduates, SpaceX veterans, and NASA award winners. Audacy delivers anytime and effortless space connectivity, advancing humanity to a new age of commerce, exploration and discovery. Connect online at https://audacy.space.

## License
Quindar is released under the MIT License. For license (terms of use), please refer to the file LICENSE.