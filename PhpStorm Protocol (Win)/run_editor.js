var settings = {
    // flag to active Jetbrain Toolbox configuration
    toolBoxActive: false,

    // Set to 'true' (without quotes) if run on Windows 64bit. Set to 'false' (without quotes) otherwise.
    x64: true,

    // Set to folder name, where PhpStorm was installed to (e.g. 'PhpStorm')
    folder_name: 'PhpStorm 2017.1.4',

    // Set to window title (only text after dash sign), that you see, when switching to running PhpStorm instance
    window_title: 'PhpStorm 2017.1.4',

    // In case your file is mapped via a network share and paths do not match.
    // eg. /var/www will can replaced with Y:/
    projects_basepath: '',
    projects_path_alias: ''
};


// don't change anything below this line, unless you know what you're doing
var url = WScript.Arguments(0),
    match = /^phpstorm:\/\/open\/?\?(url=file:\/\/|file=)(.+)&line=(\d+)$/.exec(url),
    project = '',
    editor = '"C:\\' + ( settings.x64 ? 'Program Files' : 'Program Files (x86)' ) + '\\JetBrains\\' + settings.folder_name + ( settings.x64 ? '\\bin\\phpstorm64.exe' : '\\bin\\phpstorm.exe' ) + '"';

if (settings.toolBoxActive) {
    configureToolboxSettings(settings);
}

if (match) {

    var shell = new ActiveXObject('WScript.Shell'),
        file_system = new ActiveXObject('Scripting.FileSystemObject'),
        file = decodeURIComponent(match[ 2 ]).replace(/\+/g, ' '),
        search_path = file.replace(/\//g, '\\');

    if (settings.projects_basepath !== '' && settings.projects_path_alias !== '') {
        file = file.replace(new RegExp('^' + settings.projects_basepath), settings.projects_path_alias);
    }

    while (search_path.lastIndexOf('\\') !== -1) {
        search_path = search_path.substring(0, search_path.lastIndexOf('\\'));

        if (file_system.FileExists(search_path + '\\.idea\\.name')) {
            project = search_path;
            break;
        }
    }

    if (project !== '') {
        editor += ' "%project%"';
    }

    editor += ' --line %line% "%file%"';

    var command = editor.replace(/%line%/g, match[ 3 ])
        .replace(/%file%/g, file)
        .replace(/%project%/g, project)
        .replace(/\//g, '\\');

    shell.Exec(command);
    shell.AppActivate(settings.window_title);
}

function configureToolboxSettings(settings) {
    var shell = new ActiveXObject('WScript.Shell'),
        appDataLocal = shell.ExpandEnvironmentStrings("%localappdata%"),
        toolboxDirectory = appDataLocal + '\\JetBrains\\Toolbox\\apps\\PhpStorm\\ch-0\\';

    // Reference the FileSystemObject
    var fso = new ActiveXObject('Scripting.FileSystemObject');

    // Reference the Text directory
    var folder = fso.GetFolder(toolboxDirectory);

    // Reference the File collection of the Text directory
    var fileCollection = folder.SubFolders;


    var maxVersionFolder = "0";
    // Traverse through the fileCollection using the FOR loop
    // read the maximum version from toolbox filesystem
    for (var objEnum = new Enumerator(fileCollection); !objEnum.atEnd(); objEnum.moveNext()) {
        var folderObject = ( objEnum.item() );
        if (folderObject.Name.lastIndexOf('plugins') === -1 && compareVersion(folderObject.Name, maxVersionFolder) > 0 ){
            maxVersionFolder = folderObject.Name;
        }
    }

    settings.folder_name = maxVersionFolder;

    // read version name and product name from product-info.json
    var versionFile = fso.OpenTextFile(toolboxDirectory + settings.folder_name + "\\product-info.json", 1, true);
    var content = versionFile.ReadAll();

    eval('var productVersion = ' + content + ';');
    settings.window_title = 'PhpStorm ' + productVersion.version;
    editor = '"' + toolboxDirectory + settings.folder_name + '\\' + productVersion.launch[ 0 ].launcherPath.replace(/\//g, '\\') + '"';
}

function compareVersion(v1, v2) {
    if (typeof v1 !== 'string') return false;
    if (typeof v2 !== 'string') return false;
    v1 = v1.split('.');
    v2 = v2.split('.');
    const k = Math.min(v1.length, v2.length);
    for (let i = 0; i < k; ++ i) {
        v1[i] = parseInt(v1[i], 10);
        v2[i] = parseInt(v2[i], 10);
        if (v1[i] > v2[i]) return 1;
        if (v1[i] < v2[i]) return -1;
    }
    return v1.length == v2.length ? 0: (v1.length < v2.length ? -1 : 1);
}