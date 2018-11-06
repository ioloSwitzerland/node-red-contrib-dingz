![logo](misc/logo.jpg)

### Features
- Control nodes via JSON input flows or by simply setting the values in the properties menu
- [Automatic discovery of dingz devices](#automatic-device-discovery)
- Full functionality of the dingz api (TODO)
- Status message of how the message was sent
- Status if message has arrived at destination (TODO)
- Graphical color picker for lights (TODO)


### Installation
dingz-Node-RED was written in **Node.js** v4.2.6 and tested on Node-RED v0.19.4.

To use it execute `npm install node-red-contrib-dingz`.
### Bugs

Please report all bugs through the Github issues page. Your help is greatly appreciated.

### Execution (IMPORTANT!!!)
All devices can be controlled in two ways.

  1. Give a valid JSON payload as input. What is needed for a valid input can be seen under Usage.
  2. By specifing the wished function with via the property editor. This is the easier option and is recommended for newer users. **If this option is chosen you can disregard the Usage section

If both options are available i.e. (a valid JSON gets sent as input to a dingz node which was already been setup with the property editor) the JSON input will be executed. This means **JSON takes precedence over the property editor**.

### Automatic Device discovery

![](misc/discovery.png)

Device on your network are automatically discovered on start up. You will see a warning message for each discovered device in your debug panel. Fear not this is not an actual warning but rather an information for the user. The devices detected can be selected in the dropdown menus when specifying which device to use through the property editor of a dingz node. Note: Buttons will only be discovered in configuration mode. See the section [Buttons](#buttons) for further info.


### Nodes

- [dingz One](#dingz-one)
- [dingz One+](#dingz-one+)


---

### Usage
Every request has to contain the following:


| Attribute | Type     | Description |
| :------------- | :------------- |:------------- |
| **ip**      | string       | IP address of the dingz Device      |
| **mac**      | string       | MAC address of the dingz Device      |
| **request**  |  enum[ see list for each device] | Request we want to execute  |
| data   | array  | Parameter used to further specify the request. |

The elements which are valid options for the request field are specified per-device and can be found below.


#### dingz One

#### dingz One+
