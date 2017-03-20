# Bookmark
Bookmark is a a hybrid mobile application that allows bookReaders to share, trade and rent books.

The bookmark-ionic folder contains the mobile app under developement 

## To build an ios release

Step 1 : `ionic build ios --release` 

To debug on device `ionic run ios -l -c -s`

Step 2 : open the xcode file /Users/J/Documents/Bookmark/bookmark-ionic/platforms/ios/bookmark.xcodeproj

Step 3 : on xcode, go to the info section of bookmark, under Custom ios target properties, add string values ot all the provacy keys

Step 4 : press product -> archive and then upload to itunes store



## To build an android release

Step 1 : `cordova build --release android`

Step 2 : `jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore path/to/bookmark-ionic/release-key.keystore /path/to/bookmark-ionic/platforms/android/build/outputs/apk/android-release-unsigned.apk bookmark`

*password : B..............

Step 3 : 
`zipalign -v 4 /path/to/bookmark-ionic/platforms/android/build/outputs/apk/android-release-unsigned.apk /path/to/bookmark-ionic/platforms/android/build/outputs/apk/bookmark@version.apk`

if(zipalign is not found)

`alias zipalign=~/Library/Android/sdk/build-tools/23.0.3/zipalign`
	
else if Error: spawn EACCES (permision denied to set files in bookmark-ionic)

`sudo chown -R $USER:$GROUP  ~/documents/Bookmark/bookmark-ionic`
	
Step 4 : Find the bookmark.apk and upload it to the android play store https://play.google.com/apps/publish
