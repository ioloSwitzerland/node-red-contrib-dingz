# Advanced Setup

## Execution

Some devices can be controlled in two ways. Namely the dingz Output node.

1.  Give a valid JSON payload as input. What is needed for a valid input can be seen under Usage.
2.  By specifing the wished function via the property editor. This is the easier option and is recommended for newer users. _If this option is chosen you can disregard this entire page_

If both options are available i.e. (a valid JSON gets sent as input to a dingz node which has already been setup with the property editor) the JSON input will be executed. This means **JSON takes precedence over the property editor**.

Also make sure that you can listen on port 7979 on your node-red host since otherwise the automatic device discovery will not work.

### Usage

Every request has to contain the following:

| Attribute   | Type                            | Description                                    |
| :---------- | :------------------------------ | :--------------------------------------------- |
| **ip**      | string                          | IP address of the myStrom Device               |
| **mac**     | string                          | MAC address of the myStrom Device              |
| **request** | enum[ see list for each device] | Request we want to execute                     |
| data        | array                           | Parameter used to further specify the request. |

The elements which are valid options for the request field and data field are specified per-device and can be found below.

#### dingz Output

![](misc/preview-switch.png)

| Valid requests | Type   | Description         |
| :------------- | :----- | :------------------ |
| `output`       | string | Turns the switch on |

| Valid data object | Type       | Description                        |
| :---------------- | :--------- | :--------------------------------- |
| outputZero        | int 0..100 | The new value of the first output  |
| outputOne         | int 0..100 | The new value of the second output |
| outputTwo         | int 0..100 | The new value of the third output  |
| outputThree       | int 0..100 | The new value of the forth output  |

##### Examples

We want to set the first output to 50%, the second to 0%, the third to 100% and the forth to 80%:

      { "ip": "192.168.1.00",
        "mac": "00:00:00:00:00:00"
        "request":  "output"
        "data":
        {
          "outputZero":50,
          "outputOne": 0,
          "outputTwo": 100,
          "outputThree": 80
        }
      }
