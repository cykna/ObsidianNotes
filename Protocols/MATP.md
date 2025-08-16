 MATP(short for Minecraft Addons Transfer Protocol) is just a name for a theoretical protocol used to transfer data between addons on minecraft.
It doesn't exist, then, it's not used, and I did not implement it anywhere(yet). It's only the core idea of what a protocol actually does. This is not focused on be 100% correct, but, as said, to give a core idea of what a protocol does.
In Minecraft Bedrock, until now(12/aug/25), there is no builtin way to transfer data between the so called 'addons', that are modifications inside it, the equivalent to mods on Java. So we must think a way to transfer. One thing that is does have, is to send messages to every 'addon', and each decide how to work with that message. That is called [[https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/scripteventcommandmessageafterevent?view=minecraft-bedrock-stable|scriptEvent]], the thing is that we need 2 things, an ID, and the content  of the message.
As the protocol is a bunch of rules the end users must follow to be able to interact, we can define it like the following:
On the id of the scriptevent, we specify the sender ID, and the target the packet is being sent to. So far, that's all.
On the message we can simply send the bytes, but we would need some header to tell some information about the message being sent. Let's say we want it to have confirmations about the things, so, when an addon A sends the data to the addon B, the addon B confirms it received. Then, on the header we would define if the type of message is a 'Request', 'Response', or 'Reply'.
When actually writing it, we will face that both the ID and the message of the scriptevent are strings, so, if we send something that contains a [[Null Character|null character]], it will fail and the content will be lost. Then we have to determine a way to send the content in a manner it will not be lost. We can use something like [[Base64|base64]], but it does add too much overhead; After using it the final content gets about 33% larger, so we don't want it. As the target is minecraft addons, which run on JS in a [[https://bellard.org/quickjs/|quickjs]] environment, the strings are understood by default as [[Utf16]], so we can instead of sending bytes, send a packet of 2 bytes. I didn't say, but until where i know, the total limit of chars per message is 2048, so, by sending 1 char as 1 byte, we would send only up to 2kb per message, if instead we compact 2 bytes and compact them into a single char, we could be able to send up to 4kb, so, we could use something like [[Base65536]] to actually do that before transfering the data.
So our protocol is defined in theory:
* Id of the message will have the sender and the target
* The packet will have a header containing the kind of message it's
* The packet will be converted using Base65536 before being sent
* On receiving a packet, use base65536 to get the actual bytes
In the practice, we can do some stuff to make it start taking a shape(Obs: The following codes are totally theoretical, they were not tested. The usage of rust as language is because i use it normally):
	Define the [[Sockets|socket]] interface
	Define the packet interface
	
```rust
enum MessageHeader {
	Request,
	Response,
	Reply
}

struct MessagePacket {
	header:MessageHeader,
	content: String
}

struct MATPSocket {
	identifier: u32,
	target: u32,
}
```
The socket will by now contain only it's identifier and the target. The packet contains weather it is a Request,  Response or Reply and the actual content, in rust Strings are [[Utf8]], but as the target is [[Utf16]], and this is just an example code in the language I'm more comfortable with, let's suppose the String in rust simply works as intended.
```rust
impl MATPSocket {
	pub fn new(target:u32) -> Self {
		Self {identifier: random::<u32>(), target}
	}
	///Sends the content to minecraft to the target and returns the total amount of packets sent
	pub fn send_content(&self, content: &[u8]) -> Result<usize, String> {
		let mut packet_count = 0;
		let mut offset = 0;
		while offset < content.len() {
			let packet_content = &content[offset..(offset+4096).min(content.len())];
			let packet = MessagePacket::request(packet_content);
			let raw: Vec<u16> = packet.to_raw(Encoding::Base65536);
			debug_assert!(raw.len() <= 2048);
			let id = Encoding::Base65536::encode([b'm',b'a',b't','p',self.identifier, self.target]);
			minecraft.send_script_event(id, raw);
			offset += 4096;
		}
		packet_count+1
	}
}