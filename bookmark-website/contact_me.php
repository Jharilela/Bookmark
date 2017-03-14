<?php
// Check for empty fields
header('Content-type: application/json');
$response_array = array('status' => 'success', 'content'=>'');

$name = $_POST['name'];
$email = $_POST['email'];
$subject = $_POST['subject'];
$message = $_POST['message'];

if(empty($name)){
	$response_array['status'] = 'failure'; 
	if(empty($response_array['content'])){
		$response_array['content']="empty name";
	}
}

if(empty($email)){
	$response_array['status'] = 'failure'; 
	if(empty($response_array['content'])){
		$response_array['content']="empty email";
	}
}

if(empty($subject)){
	$response_array['status'] = 'failure'; 
	if(empty($response_array['content'])){
		$response_array['content']="empty subject";
	}
}

if(empty($message)){
	$response_array['status'] = 'failure'; 
	if(empty($response_array['content'])){
		$response_array['content']="empty message";
	}
}

if(!filter_var($email,FILTER_VALIDATE_EMAIL)){
	$response_array['status'] = 'failure'; 
	if(empty($response_array['content'])){
		$response_array['content']="email invalid";
	}
}
   
$name = strip_tags(htmlspecialchars($_POST['name']));
$email_address = strip_tags(htmlspecialchars($_POST['email']));
$subject = strip_tags(htmlspecialchars($_POST['subject']));
$message = strip_tags(htmlspecialchars($_POST['message']));

// // Create the email and send the message
$to = 'jharilela@gmail.com'; // Add your email address inbetween the '' replacing yourname@yourdomain.com - This is where the form will send a message to.
$email_subject = "Bookmark Contact Form:  $name";
$email_body = "You have received a new message from your website contact form.\n\n"."Here are the details:\n\nName: $name\n\nEmail: $email_address\n\nSubject: $subject\n\nMessage:\n$message";
$headers = "From: noreply@jaboski.bookmark.com\n"; // This is the email address the generated message will be from. We recommend using something like noreply@yourdomain.com.
$headers .= "Reply-To: $email_address";   
if(mail($to,$email_subject,$email_body,$headers)){
	
}
else{
 	$response_array['status'] = 'failure';
 	$response_array['content'] = 'unable to send mail';
}    

echo json_encode($response_array);  
?>
